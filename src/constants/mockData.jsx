// src/constants/mockData.js
import {
  formatDate,
  getTodayDateString,
  getNextDays as getNextNCalDays,
} from "../utils/dateUtils";
import { API_ENDPOINTS_ADMIN as ADMIN_API } from "./config"; // For consistency if some IDs are used

// --- Base Data for Mocks (from earlier definitions, ensure consistency) ---
// These would be fetched by admin panel or DataContext from actual admin APIs if available
// but for public mock, we define them here.

export const mockPublicActorsData = [
  {
    actorId: 101,
    name: "안야 테일러-조이",
    birthDate: "1996-04-16",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/FFC0CB/000000?text=AnyaM",
  },
  {
    actorId: 102,
    name: "크리스 헴스워스",
    birthDate: "1983-08-11",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/ADD8E6/000000?text=ChrisM",
  },
  {
    actorId: 103,
    name: "톰 버크",
    birthDate: "1981-06-30",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/90EE90/000000?text=TomM",
  },
  {
    actorId: 104,
    name: "마동석",
    birthDate: "1971-03-01",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/FFFFE0/000000?text=MaM",
  },
  {
    actorId: 105,
    name: "김무열",
    birthDate: "1982-05-22",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/E6E6FA/000000?text=KimM",
  },
  {
    actorId: 106,
    name: "박지환",
    birthDate: "1980-09-05",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/DDA0DD/000000?text=ParkM",
  },
  {
    actorId: 107,
    name: "이동휘",
    birthDate: "1985-07-22",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/DB7093/000000?text=LeeM",
  },
  {
    actorId: 108,
    name: "변요한",
    birthDate: "1986-04-29",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/FFDAB9/000000?text=ByunM",
  },
  {
    actorId: 109,
    name: "신혜선",
    birthDate: "1989-08-31",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/87CEFA/000000?text=ShinM",
  },
  {
    actorId: 110,
    name: "이엘",
    birthDate: "1982-08-26",
    biography: "배우",
    profileImageUrl: "https://placehold.co/100x100/F0E68C/000000?text=LeeElM",
  },
];

export const mockPublicGenresData = [
  { genreId: 201, genreName: "액션" },
  { genreId: 202, genreName: "범죄" },
  { genreId: 203, genreName: "미스터리" },
  { genreId: 204, genreName: "스릴러" },
  { genreId: 205, genreName: "드라마" },
  { genreId: 206, genreName: "SF" },
];

export const mockPublicRatingsData = [
  {
    ratingId: 301,
    ratingName: "전체 관람가",
    description: "모든 연령 관람 가능.",
  },
  {
    ratingId: 302,
    ratingName: "12세 이상 관람가",
    description: "만 12세 이상 관람 가능.",
  },
  {
    ratingId: 303,
    ratingName: "15세 이상 관람가",
    description: "만 15세 이상 관람 가능.",
  },
  {
    ratingId: 304,
    ratingName: "청소년 관람불가",
    description: "만 19세 미만 관람 불가.",
  },
];

export const mockPublicDistributorsData = [
  {
    distributorId: 401,
    name: "워너 필름즈",
    address: "서울시",
    phone: "02-000-0000",
  },
  {
    distributorId: 402,
    name: "쇼박스",
    address: "서울시",
    phone: "02-000-0000",
  },
  {
    distributorId: 403,
    name: "롯데 엔터테인먼트",
    address: "서울시",
    phone: "02-000-0000",
  },
];

// --- Mock Movies for Public Pages (MovieResponseDto structure) ---
export const mockPublicMovies = [
  {
    // Movie 1
    movieId: 1,
    title: "퓨리오사: 매드맥스 사가 (Mock)",
    description:
      "문명 붕괴 45년 후, 황폐해진 세상에 무참히 던져진 퓨리오사가 고향으로 돌아가기 위해 자신의 모든 것을 걸고 떠나는 거대한 여정을 그린 액션 블록버스터 (목업 데이터)",
    duration: 148,
    releaseDate: "2024-05-22",
    language: "영어",
    director: "조지 밀러 (Mock)",
    distributor: mockPublicDistributorsData[0],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[0], mockPublicGenresData[5]], // 액션, SF
    movieCasts: [
      { actor: mockPublicActorsData[0], role: "퓨리오사" },
      { actor: mockPublicActorsData[1], role: "디멘투스" },
      { actor: mockPublicActorsData[2], role: "프레토리안 잭" },
    ],
    posterUrl: "https://placehold.co/300x450/1a202c/ffffff?text=FuriosaM",
    voteAverage: 9.1, // 예시 평점 (10점 만점)
    // trailerUrl, backdropUrl 등 추가 가능
  },
  {
    // Movie 2
    movieId: 2,
    title: "범죄도시4 (Mock)",
    description:
      "신종 마약 사건 3년 뒤, 괴물형사 마석도와 서울 광수대는 배달앱을 이용한 마약 판매 사건을 수사하던 중... (목업 데이터)",
    duration: 109,
    releaseDate: "2024-04-24",
    language: "한국어",
    director: "허명행 (Mock)",
    distributor: mockPublicDistributorsData[1],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[0], mockPublicGenresData[1]], // 액션, 범죄
    movieCasts: [
      { actor: mockPublicActorsData[3], role: "마석도" },
      { actor: mockPublicActorsData[4], role: "백창기" },
      { actor: mockPublicActorsData[5], role: "장이수" },
      { actor: mockPublicActorsData[6], role: "장동철" },
    ],
    posterUrl: "https://placehold.co/300x450/2d3748/ffffff?text=Roundup4M",
    voteAverage: 8.5,
  },
  {
    // Movie 3
    movieId: 3,
    title: "그녀가 죽었다 (Mock)",
    description:
      "고객이 맡긴 열쇠로 그 집을 몰래 드나들며 남의 삶을 훔쳐보는 악취미를 가진 공인중개사 구정태... (목업 데이터)",
    duration: 103,
    releaseDate: "2024-05-15",
    language: "한국어",
    director: "김세휘 (Mock)",
    distributor: mockPublicDistributorsData[2],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[2], mockPublicGenresData[3]], // 미스터리, 스릴러
    movieCasts: [
      { actor: mockPublicActorsData[7], role: "구정태" },
      { actor: mockPublicActorsData[8], role: "한소라" },
      { actor: mockPublicActorsData[9], role: "오영주" },
    ],
    posterUrl: "https://placehold.co/300x450/4a5568/ffffff?text=SheIsDeadM",
    voteAverage: 7.9,
  },
  {
    // Movie 4
    movieId: 4,
    title: "그녀가 죽었다 (Mock)",
    description:
      "고객이 맡긴 열쇠로 그 집을 몰래 드나들며 남의 삶을 훔쳐보는 악취미를 가진 공인중개사 구정태... (목업 데이터)",
    duration: 103,
    releaseDate: "2024-05-15",
    language: "한국어",
    director: "김세휘 (Mock)",
    distributor: mockPublicDistributorsData[2],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[2], mockPublicGenresData[3]], // 미스터리, 스릴러
    movieCasts: [
      { actor: mockPublicActorsData[7], role: "구정태" },
      { actor: mockPublicActorsData[8], role: "한소라" },
      { actor: mockPublicActorsData[9], role: "오영주" },
    ],
    posterUrl: "https://placehold.co/300x450/4a5568/ffffff?text=SheIsDeadM",
    voteAverage: 7.9,
  },
  {
    // Movie 5
    movieId: 5,
    title: "그녀가 죽었다 (Mock)",
    description:
      "고객이 맡긴 열쇠로 그 집을 몰래 드나들며 남의 삶을 훔쳐보는 악취미를 가진 공인중개사 구정태... (목업 데이터)",
    duration: 103,
    releaseDate: "2024-05-15",
    language: "한국어",
    director: "김세휘 (Mock)",
    distributor: mockPublicDistributorsData[2],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[2], mockPublicGenresData[3]], // 미스터리, 스릴러
    movieCasts: [
      { actor: mockPublicActorsData[7], role: "구정태" },
      { actor: mockPublicActorsData[8], role: "한소라" },
      { actor: mockPublicActorsData[9], role: "오영주" },
    ],
    posterUrl: "https://placehold.co/300x450/4a5568/ffffff?text=SheIsDeadM",
    voteAverage: 7.9,
  },
  {
    // Movie 6
    movieId: 6,
    title: "그녀가 죽었다 (Mock)",
    description:
      "고객이 맡긴 열쇠로 그 집을 몰래 드나들며 남의 삶을 훔쳐보는 악취미를 가진 공인중개사 구정태... (목업 데이터)",
    duration: 103,
    releaseDate: "2024-05-15",
    language: "한국어",
    director: "김세휘 (Mock)",
    distributor: mockPublicDistributorsData[2],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[2], mockPublicGenresData[3]], // 미스터리, 스릴러
    movieCasts: [
      { actor: mockPublicActorsData[7], role: "구정태" },
      { actor: mockPublicActorsData[8], role: "한소라" },
      { actor: mockPublicActorsData[9], role: "오영주" },
    ],
    posterUrl: "https://placehold.co/300x450/4a5568/ffffff?text=SheIsDeadM",
    voteAverage: 7.9,
  },
  {
    // Movie 7
    movieId: 7,
    title: "그녀가 죽었다 (Mock)",
    description:
      "고객이 맡긴 열쇠로 그 집을 몰래 드나들며 남의 삶을 훔쳐보는 악취미를 가진 공인중개사 구정태... (목업 데이터)",
    duration: 103,
    releaseDate: "2024-05-15",
    language: "한국어",
    director: "김세휘 (Mock)",
    distributor: mockPublicDistributorsData[2],
    movieRating: mockPublicRatingsData[2], // 15세
    genres: [mockPublicGenresData[2], mockPublicGenresData[3]], // 미스터리, 스릴러
    movieCasts: [
      { actor: mockPublicActorsData[7], role: "구정태" },
      { actor: mockPublicActorsData[8], role: "한소라" },
      { actor: mockPublicActorsData[9], role: "오영주" },
    ],
    posterUrl: "https://placehold.co/300x450/4a5568/ffffff?text=SheIsDeadM",
    voteAverage: 7.9,
  },
];

// --- Mock Screening Rooms for Public Pages (ScreeningRoomResponseDto structure) ---
// Admin API(/api/admin/screening-rooms/get)의 응답과 동일한 구조를 가정합니다.
export const mockPublicScreeningRooms = [
  {
    roomId: 501,
    roomName: "1관 (Mock)",
    capacity: 100,
    seatLayout: [
      { rowIdentifier: "A", numberOfSeats: 10 },
      { rowIdentifier: "B", numberOfSeats: 10 } /* ... up to 100 */,
    ],
  },
  {
    roomId: 502,
    roomName: "2관 (Mock)",
    capacity: 120,
    seatLayout: [{ rowIdentifier: "A", numberOfSeats: 12 } /* ... up to 120 */],
  },
  {
    roomId: 503,
    roomName: "3관-IMAX (Mock)",
    capacity: 150,
    seatLayout: [{ rowIdentifier: "A", numberOfSeats: 15 } /* ... up to 150 */],
  },
];
// Fill seatLayout more completely for mockPublicScreeningRooms if needed for seat map display.
mockPublicScreeningRooms.forEach((room) => {
  if (
    room.seatLayout.length === 1 &&
    room.seatLayout[0].numberOfSeats < room.capacity
  ) {
    const rows = Math.ceil(room.capacity / room.seatLayout[0].numberOfSeats);
    const seatsPerRow = room.seatLayout[0].numberOfSeats;
    room.seatLayout = [];
    for (let i = 0; i < rows; i++) {
      room.seatLayout.push({
        rowIdentifier: String.fromCharCode(65 + i),
        numberOfSeats: seatsPerRow,
      });
    }
    // Adjust last row if capacity is not perfectly divisible
    const calculatedCapacity = rows * seatsPerRow;
    if (calculatedCapacity > room.capacity) {
      room.seatLayout[rows - 1].numberOfSeats -=
        calculatedCapacity - room.capacity;
    }
  }
});

// --- Mock Screenings for Public Pages (ScreeningResponseDto structure) ---
// Generates mock screenings for the next few days for the mock movies.
export const mockPublicScreenings = [];
const today = new Date();
const screeningDates = getNextNCalDays(5, today).map((d) => d.shortDate); // 5일치 상영 정보 생성

mockPublicMovies.forEach((movie) => {
  screeningDates.forEach((dateStr, dateIndex) => {
    mockPublicScreeningRooms.forEach((room, roomIndex) => {
      // Create 2-3 screenings per movie, per date, per room (example)
      for (let i = 0; i < (dateIndex % 2 === 0 ? 2 : 3); i++) {
        const hour = 10 + i * 3 + roomIndex; // Stagger times: 10:00, 13:00, 16:00, etc.
        if (hour >= 22) continue; // Don't create screenings too late

        const screeningTimeStr = `${dateStr} ${String(hour).padStart(2, "0")}:${
          i % 2 === 0 ? "00" : "30"
        }:00`;

        mockPublicScreenings.push({
          screeningId: parseInt(
            `${movie.movieId}${dateStr.replace(/-/g, "").substring(4)}${
              room.roomId
            }${i}`
          ), // Unique ID
          movie: { movieId: movie.movieId, title: movie.title },
          screeningRoom: { roomId: room.roomId, roomName: room.roomName },
          screeningDate: dateStr, // YYYY-MM-DD
          screeningSequence: i + 1, // 회차
          screeningTime: screeningTimeStr, // YYYY-MM-DD HH:mm:ss
          totalSeats: room.capacity,
          availableSeats: Math.floor(
            room.capacity * (Math.random() * 0.5 + 0.3)
          ), // 30-80% available
        });
      }
    });
  });
});

// --- Mock Price Settings for Public Pages (PriceSettingResponseDto structure) ---
// These would correspond to the mock ticket types and mock rooms
export const mockPublicTicketTypes = [
  { ticketTypeId: 601, typeName: "성인 (Mock)", description: "만 19세 이상" },
  {
    ticketTypeId: 602,
    typeName: "청소년 (Mock)",
    description: "만 13세 ~ 18세",
  },
  {
    ticketTypeId: 603,
    typeName: "어린이 (Mock)",
    description: "만 7세 ~ 12세",
  },
];

export const mockPublicPriceSettings = [];
mockPublicScreeningRooms.forEach((room) => {
  mockPublicTicketTypes.forEach((tt, index) => {
    let price = 15000;
    if (tt.typeName.includes("청소년")) price = 12000;
    if (tt.typeName.includes("어린이")) price = 9000;
    if (room.roomName.includes("IMAX")) price += 5000; // IMAX surcharge

    mockPublicPriceSettings.push({
      roomId: room.roomId,
      roomName: room.roomName,
      ticketTypeId: tt.ticketTypeId,
      ticketTypeName: tt.typeName,
      price: price,
    });
  });
});

// --- Helper for generating mock seat layout if needed for BookingPage ---
// This is already in utils/seatUtils.js, but can be kept here if specific to mock generation
export const generateMockSeatLayout = (room, bookedSeatIds = []) => {
  // Uses room.seatLayout which is RowDefinitionDto[]
  if (!room || !room.seatLayout) return [];
  const layout = [];
  room.seatLayout.forEach((rowDef) => {
    const rowSeats = [];
    for (let i = 1; i <= rowDef.numberOfSeats; i++) {
      const seatId = `${rowDef.rowIdentifier}${i}`;
      rowSeats.push({
        id: seatId,
        status: bookedSeatIds.includes(seatId) ? "booked" : "available",
        row: rowDef.rowIdentifier,
        number: i,
      });
    }
    layout.push(rowSeats);
  });
  return layout;
};

console.log("Generated Mock Public Screenings:", mockPublicScreenings.length);
console.log(
  "Generated Mock Public Price Settings:",
  mockPublicPriceSettings.length
);
