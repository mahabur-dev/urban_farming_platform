import axios from 'axios';
import AppError from '../error/appError';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { RoomGallery } from '../modules/images/images.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// ── V2 Base URL ───────────────────────────────────────────────────────────────
const BEDS24_V2 = 'https://beds24.com/api/v2';

// ── Stripe ────────────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// ── Room → propId map (unchanged) ─────────────────────────────────────────────
export const ROOM_PROP_MAP: Record<number, string> = {
  334679: '150956', 336039: '150956', 336040: '150956',
  342568: '150956', 342569: '150956', 342570: '150956',
  342571: '150956', 352148: '150956', 352154: '150956',
  352156: '150956', 352157: '150956', 363730: '150956',
  363731: '150956',
  337089: '152084',
};

// ── Token management ──────────────────────────────────────────────────────────
let _accessToken:   string = process.env.BEDS24_ACCESS_TOKEN  || '';
let _tokenExpiry:   number = Date.now() + 23 * 60 * 60 * 1000; // 23 hours

const getToken = async (): Promise<string> => {
  // Refresh if expired or about to expire
  if (!_accessToken || Date.now() >= _tokenExpiry) {
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN || '';
    if (!refreshToken) throw new AppError(500, 'BEDS24_REFRESH_TOKEN not configured');

    const res = await axios.get(`${BEDS24_V2}/authentication/token`, {
      headers: { refreshToken },
    });

    _accessToken = res.data.token;
    _tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  }
  return _accessToken;
};

const v2Get = async (path: string, params: Record<string, any> = {}): Promise<any> => {
  const token = await getToken();
  const res   = await axios.get(`${BEDS24_V2}${path}`, {
    headers: { token, accept: 'application/json' },
    params,
  });

  // V2 wraps response: { success: true, data: [...], count, pages }
  // Return data array if present, otherwise return raw
  return res.data?.data ?? res.data;
};

const v2Post = async (path: string, body: any): Promise<any> => {
  try {
    const token = await getToken();
    const res   = await axios.post(`${BEDS24_V2}${path}`, body, {
      headers: { token, 'Content-Type': 'application/json', accept: 'application/json' },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    console.error(`v2Post ${path} failed:`, JSON.stringify(error?.response?.data));
    if (error?.response?.status === 401) {
      _tokenExpiry = 0;
      const token = await getToken();
      const res   = await axios.post(`${BEDS24_V2}${path}`, body, {
        headers: { token, 'Content-Type': 'application/json', accept: 'application/json' },
      });
      return res.data?.data ?? res.data;
    }
    throw error;
  }
};

export const fetchProperties = async (): Promise<any> => {
  try {
    // v2Get already returns res.data?.data ?? res.data
    // so this returns the array directly: [{ id: 150956, ... }, { id: 152084, ... }]
     return await v2Get('/properties', {
      includeAllRooms: true,      // ← this includes roomTypes in response
      includeTexts:    'all',     // ← includes both property and roomType texts
    });
  } catch (error: any) {
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};
export const fetchFromBeds24 = async (roomIds: number[]): Promise<any> => {
  try {
    // ── Collect all unique propIds for the given roomIds ──────────────────────
    const propIds = [...new Set(
      roomIds
        .map(id => ROOM_PROP_MAP[id])
        .filter(Boolean)
    )];

    if (propIds.length === 0) {
      propIds.push('150956'); // fallback
    }

    // ── Fetch V2 property data + DB images in parallel ────────────────────────
    const [data, galleryDocs] = await Promise.all([
      v2Get('/properties', {
        id:              propIds,        // ✅ now passes array like [150956, 152084]
        includeAllRooms: true,
        includeTexts:    'all',
      }),
      RoomGallery.find({ roomId: { $in: roomIds }, isActive: true }).lean(),
    ]);
    // console.log(galleryDocs);
    // ── Build roomId → active image URLs map from DB ──────────────────────────
    const dbImageMap: Record<string, { url: string; alt: string }[]> = {};
    galleryDocs.forEach((gallery: any) => {
      dbImageMap[String(gallery.roomId)] = (gallery.images || [])
        .filter((img: any) => img.isActive)
        .map((img: any) => ({
          url: img.url,
          alt: img.alt || ""
        }));
    });

    // ── Normalize response: always work with array of properties ──────────────
    const properties: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : data
          ? [data]
          : [];

    if (properties.length === 0) throw new AppError(404, 'No properties found in V2 response');

    // ── Build roomIds map across ALL returned properties ──────────────────────
    const roomIdsSet = new Set(roomIds.map(String));
    const roomIdsMap: Record<string, any> = {};

    for (const prop of properties) {
      (prop.roomTypes || []).forEach((room: any) => {
        const id = String(room.id);
        if (!roomIdsSet.has(id)) return;

        const enText = (room.texts || []).find(
          (t: any) => t.language === 'en' || t.language === 'EN',
        ) || room.texts?.[0] || {};

        roomIdsMap[id] = {
          name:            room.name,
          rackRate:        String(room.rackRate        ?? 0),
          cleaningFee:     String(room.cleaningFee     ?? 0),
          securityDeposit: String(room.securityDeposit ?? 0),
          taxPercent:      String(room.taxPercentage   ?? 0),
          featureCodes:    room.featureCodes || [],
          texts: {
            roomDescription1:  { EN: enText.roomDescription  || '' },
            accommodationType: { EN: enText.accommodationType || 'villa' },
            offers: {},
          },
        };
      });
    }

    // ── Build hosted images from DB ───────────────────────────────────────────
    const hosted: Record<string, any> = {};
    let   idx = 0;

    // Object.entries(dbImageMap).forEach(([roomId, urls]) => {
    //   urls.forEach((url) => {
    //     hosted[String(idx)] = {
    //       url,
    //       map: [{ roomId, position: String(idx) }],
    //     };
    //     idx++;
    //   });
    // });
    Object.entries(dbImageMap).forEach(([roomId, urls]) => {
      urls.forEach((img) => {
        hosted[String(idx)] = {
          url: img.url,
          alt: img.alt || "",
          map: [{ roomId, position: String(idx) }],
        };
        idx++;
      });
    });

    // ── Return one entry per property, each with its relevant rooms ───────────
    const getPropertyContent = properties
      .filter(prop => {
        // Only include properties that have at least one requested room
        return (prop.roomTypes || []).some((r: any) => roomIdsSet.has(String(r.id)));
      })
      .map(prop => {
        // Rooms belonging to THIS property
        const propRoomIds: Record<string, any> = {};
        (prop.roomTypes || []).forEach((room: any) => {
          const id = String(room.id);
          if (roomIdsMap[id]) propRoomIds[id] = roomIdsMap[id];
        });

        return {
          propId:  String(prop.id),
          roomIds: propRoomIds,
          images:  { hosted },
        };
      });

    return { getPropertyContent };

  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};
export const fetchRoomDates = async (
  roomId:    number,
  startDate: string,
  endDate:   string,
): Promise<any> => {
  try {
    const fmt = (d: string) => `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
    const params = {
      roomId,
      startDate: fmt(startDate),
      endDate:   fmt(endDate),
    };

    // ── Fetch availability + calendar in parallel ─────────────────────────────
    const [availData, calendarData] = await Promise.all([
      v2Get('/inventory/rooms/availability', params),
      v2Get('/inventory/rooms/calendar',     params).catch(() => []),
    ]);

    const roomAvail    = Array.isArray(availData)   ? availData[0]   : availData;
    const roomCalendar = Array.isArray(calendarData) ? calendarData[0] : calendarData;

    if (!roomAvail?.availability) return {};

    // Build calendar lookup: { "2026-03-18": { price, minStay } }
    const calendarMap: Record<string, any> = {};
    (roomCalendar?.calendar || []).forEach((entry: any) => {
      calendarMap[entry.date] = entry;
    });

    // Transform → V1 shape
    const result: Record<string, any> = {};

    Object.entries(roomAvail.availability as Record<string, boolean>).forEach(
      ([date, available]) => {
        const key     = date.replace(/-/g, '');
        const calEntry = calendarMap[date] || {};
        result[key] = {
          i:  available ? 0 : 1,
          p1: calEntry.price1 ?? calEntry.price ?? 0,
          m:  calEntry.minStay ?? calEntry.minimumStay ?? 1,
        };
      }
    );

    return result;
  } catch (error: any) {
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};

export const fetchAllBookings = async (filters: Record<string, any> = {}): Promise<any[]> => {

  const v2Filters: Record<string, any> = {
    pageSize:            1000,
    includeInvoiceItems: filters.includeInvoice || false,
    includePersonal:     true,
  };

  if (filters.bookId)     v2Filters.id         = filters.bookId;
  if (filters.roomId)     v2Filters.roomId      = filters.roomId;
  if (filters.propId)     v2Filters.propId      = filters.propId;
  if (filters.firstNight) v2Filters.arrivalFrom = filters.firstNight;
  if (filters.lastNight)  v2Filters.arrivalTo   = filters.lastNight;

  const STATUS_MAP: Record<string, string> = {
    '0': 'cancelled',
    '1': 'confirmed',
    '2': 'new',
    '3': 'request',
  };
  if (filters.status && filters.status !== 'all') {
    v2Filters.status = STATUS_MAP[filters.status] ?? filters.status;
  }

  try {
    const data: any[] = await v2Get('/bookings', v2Filters);

    if (!Array.isArray(data) || !data.length) return [];

    return data.map((b: any) => ({
      bookId:           String(b.id),
      roomId:           String(b.roomId),
      propId:           String(b.propertyId),      // ✅ was b.propId (wrong key)
      status:           String(
                          b.status === 'confirmed' ? 1 :
                          b.status === 'cancelled' ? 0 :
                          b.status === 'new'       ? 2 :
                          b.status === 'request'   ? 3 : 5
                        ),
      substatus:        String(b.subStatus ?? 0),
      firstNight:       b.arrival,
      lastNight:        b.departure,
      numAdult:         String(b.numAdult  ?? 0),
      numChild:         String(b.numChild  ?? 0),

      // ✅ Fields are TOP LEVEL in Beds24 v2 — NOT nested under b.guest
      guestTitle:       b.title       || '',
      guestFirstName:   b.firstName   || '',
      guestName:        b.lastName    || '',
      guestEmail:       b.email       || '',
      guestPhone:       b.phone       || '',
      guestMobile:      b.mobile      || '',
      guestCompany:     b.company     || '',
      guestAddress:     b.address     || '',
      guestCity:        b.city        || '',
      guestState:       b.state       || '',
      guestPostcode:    b.postcode    || '',
      guestCountry2:    b.country2    || '',
      guestArrivalTime: b.arrivalTime || '',
      guestComments:    b.comments    || '',
      guestVoucher:     b.voucher     || '',

      price:            String(b.price        ?? 0),
      deposit:          String(b.deposit      ?? 0),
      tax:              String(b.tax          ?? 0),
      commission:       String(b.commission   ?? 0),
      currency:         b.currency            || 'THB',
      rateDescription:  b.rateDescription     || '',
      offerId:          String(b.offerId      ?? 0),
      referer:          b.referer             || '',
      flagColor:        b.flagColor           || '',
      flagText:         b.flagText            || '',
      stripeToken:      b.stripeToken         || '',
      bookingTime:      b.bookingTime         || '',
      modified:         b.modifiedTime        || '',  // ✅ was b.modified (wrong key)
      cancelTime:       b.cancelTime          || '',
      notes:            b.notes               || '',
      invoice:          b.invoiceItems        || [],
    }));

  } catch (error: any) {
    throw new AppError(502, `Beds24 bookings request failed: ${error.message}`);
  }
};
// ── fetchBookingWithInvoice → GET /bookings?id=xxx&includeInvoiceItems=true ───
export const fetchBookingWithInvoice = async (bookId: string): Promise<any> => {
  const data = await fetchAllBookings({ bookId, includeInvoice: true });
  return data[0] || null;
};

// ── createBeds24Booking → POST /bookings ─────────────────────────────────────
export const createBeds24Booking = async (bookingData: any): Promise<any> => {
  try {
    // Transform V1 flat shape → V2 nested shape
    const v2Body = [{
      roomId:    parseInt(bookingData.roomId, 10),
      arrival:   bookingData.firstNight,
      departure: bookingData.lastNight,
      numAdult:  parseInt(bookingData.numAdult || '1', 10),
      numChild:  parseInt(bookingData.numChild || '0', 10),
      status:    'inquiry', // default to 'inquiry' for new bookings
      referer:   bookingData.referer || 'website',
      notes:     bookingData.notes  || '',
      firstName:   bookingData.guestFirstName   || '',
      lastName:    bookingData.guestName         || '',
      email:       bookingData.guestEmail        || '',
      phone:       bookingData.guestPhone        || '',
      mobile:      bookingData.guestMobile       || '',
      address:     bookingData.guestAddress      || '',
      city:        bookingData.guestCity         || '',
      country:     bookingData.guestCountry      || '',
      postcode:    bookingData.guestPostcode     || '',
      comments:    bookingData.guestComments     || '',
      voucherCode: bookingData.guestVoucher      || '',
      arrivalTime: bookingData.guestArrivalTime  || '',
    }];
    const result  = await v2Post('/bookings', v2Body);
    const created = Array.isArray(result) ? result[0] : result;

    // ── V2 response shape: { success, new: { id }, info: [] } ────────────────
    const bookId = String(
      created?.new?.id      ||   // ← V2 shape
      created?.id           ||   // ← fallback
      created?.info?.[0]?.id||   // ← fallback from info array
      '',
    );

    return { bookId, ...created };

  } catch (error: any) {
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};

export const addBookingPayment = async (
  bookId:            string,
  amount:            number,
  description:       string,
  status:            string = 'Payment',
  stripePaymentIntentId?: string,
): Promise<any> => {
  try {
    const body = [{
      id: parseInt(bookId, 10),
      invoiceItems: [{
        description,
        type:   status,       // "Payment"
        amount: -amount,      // negative = money received
        // attach Stripe reference for tracking
        ...(stripePaymentIntentId && { notes: stripePaymentIntentId }),
      }],
    }];

    const result = await v2Post('/bookings', body);
    const updated = Array.isArray(result) ? result[0] : result;
    return { bookId: String(updated?.id || bookId), ...updated };
  } catch (error: any) {
    throw new AppError(502, `Beds24 payment recording failed: ${error.message}`);
  }
};

// ── cancelBeds24Booking → POST /bookings (status: cancelled) ─────────────────
export const cancelBeds24Booking = async (bookId: string): Promise<any> => {
  try {
    const result = await v2Post('/bookings', [{ id: parseInt(bookId, 10), status: 'cancelled' }]);
    const updated = Array.isArray(result) ? result[0] : result;
    return { bookId: String(updated?.id || bookId), ...updated };
  } catch (error: any) {
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};
export const updateBeds24BookingStatus = async (bookId: string): Promise<any> => {
  try {
    const result = await v2Post('/bookings', [{ id: parseInt(bookId, 10), status: 'confirmed' }]);
    const updated = Array.isArray(result) ? result[0] : result;
    return { bookId: String(updated?.id || bookId), ...updated };
  } catch (error: any) {
    throw new AppError(502, `Beds24 API request failed: ${error.message}`);
  }
};
export const fetchAvailabilities = async (
  checkIn:  string,
  checkOut: string,
  numAdult: number = 2,
  numChild: number = 0,
): Promise<any> => {
  try {
    const fmt = (d: string) => `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;

    const response: any = await v2Get('/inventory/rooms/offers', {
      arrival:     fmt(checkIn),
      departure:   fmt(checkOut),
      numAdults:   numAdult,
      numChildren: numChild,
    });

    // V2 wraps rooms inside response.data array
    const rooms: any[] = response?.data || response || [];

    const result: Record<string, any> = {
      checkIn,
      checkOut,
      numAdult,
    };

    rooms.forEach((room: any) => {
      const rId       = String(room.roomId);
      const offers    = room.offers || [];
      const bestOffer = offers[0];
      const available = offers.length > 0 && (bestOffer?.unitsAvailable ?? 0) > 0;

      result[rId] = {
        roomId:        rId,
        propId:        String(room.propertyId || ROOM_PROP_MAP[room.roomId] || '150956'),
        roomsavail:    available ? 1 : 0,
        price:         bestOffer?.price        ?? 0,
        priceFormated: bestOffer?.price        ? ` ฿${bestOffer.price} ` : '',
        currency:      bestOffer?.currency     ?? 'THB',
      };
    });

    return result;
  } catch (error: any) {
    throw new AppError(502, `Beds24 availability request failed: ${error.message}`);
  }
};

// export const createBeds24StripeSession = async (
//   bookId:      string,
//   amount:      number,
//   currency:    string = 'THB',
//   description: string = 'Accommodation',
//   capture:     boolean = true,
// ): Promise<any> => {
//   try {
//     // ── V2 correct request format ─────────────────────────────────────────────
//     const body = [{
//       action:    'createStripeSession',
//       bookingId: parseInt(bookId, 10),          // ← bookingId not bookId
//       capture,
//       success_url: `${process.env.FRONTEND_URL}/booking-confirmed/${bookId}`,
//       cancel_url:  `${process.env.FRONTEND_URL}/booking-cancelled/${bookId}`,
//       line_items: [
//         {
//           price_data: {
//             currency:     currency.toLowerCase(),
//             unit_amount:  Math.round(amount * 100),
//             product_data: {
//               name: description,
//             },
//           },
//           quantity: 1,
//         },
//       ],
//     }];

//     const result  = await v2Post('/channels/stripe', body);

//     // ── V2 response: [{ success, new: { stripeSession: {...} } }] ─────────────
//     const raw     = Array.isArray(result) ? result[0] : result;
//     const session = raw?.new?.stripeSession ?? raw;

//     return session;
//   } catch (error: any) {
//     console.error('createBeds24StripeSession error:', error?.response?.data);
//     throw new AppError(402, `Beds24 Stripe session failed: ${error.message}`);
//   }
// };
export const createBeds24StripeSession = async (
  bookId:   string,
  amount:   number,
  currency: string  = 'THB',
  deposit:  string  = 'Deposit Full',   // ← renamed from description
  capture:  boolean = true,
): Promise<any> => {
  try {

    const body = [{
      action:      'createStripeSession',
      bookingId:   parseInt(bookId, 10),
      capture,
      success_url: `${process.env.FRONTEND_URL}/booking-confirmed/${bookId}`,
      cancel_url:  `${process.env.FRONTEND_URL}/booking-cancelled/${bookId}`,
      line_items: [
        {
          price_data: {
            currency:    currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: deposit,   // ← "Deposit Full" or "Deposit 30%" shown on Stripe
            },
          },
          quantity: 1,
        },
      ],
    }];

    // console.log('createBeds24StripeSession body: send me ', JSON.stringify(body));

    const result  = await v2Post('/channels/stripe', body);
    // console.log('[Beds24] raw response: back beds24', JSON.stringify(result, null, 2));

    const raw     = Array.isArray(result) ? result[0] : result;
    const session = raw?.new?.stripeSession ?? raw;

    return session;
  } catch (error: any) {
    console.error('createBeds24StripeSession error:', error?.response?.data);
    throw new AppError(402, `Beds24 Stripe session failed: ${error.message}`);
  }
};

export const deleteBeds24Booking = async (bookId: string): Promise<any> => {
  try {
    // console.log('Attempting to delete booking with ID:', bookId);
    const token = await getToken();
    const res = await axios.delete(`${BEDS24_V2}/bookings`, {
      headers: { token, accept: 'application/json' },
      params: { id: parseInt(bookId, 10) },
    });
    // console.log('deleteBeds24Booking response:', res.data, res);
    return res.data;
  } catch (error: any) {
    throw new AppError(502, `Beds24 delete booking failed: ${error.errors.message || error.message}`);
  }
};