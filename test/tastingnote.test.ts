import { describe, expect, test, beforeAll, mock } from "bun:test";
import { createTestApp, createTestToken } from "./setup";
import type { Elysia } from "elysia";

const BASE_NOTE = {
  noteId: 1,
  title: "테스트 노트",
  content: "테스트 내용",
  writerId: 1,
  writerName: "테스터",
  writerImage: null,
  alcoholName: "글렌피딕 12년",
  alcoholCategory: "위스키",
  like: 0,
  unlike: 0,
  viewer: 0,
  createdTime: new Date().toISOString(),
  aroma_note: {},
  palate_note: {},
  finish_note: {},
  images: [],
  comments: [],
};

const NOTE_WITH_IMAGE = {
  noteId: 1,
  noteTitle: "글렌피딕 12년 첫 시음",
  alcoholCategory: "위스키",
  alcoholName: "글렌피딕 12년",
  noteImage: "https://example.com/note.jpg",
  writer: "홍길동",
  writerImage: "https://example.com/profile.jpg",
  commentNum: 2,
  like: 5,
  unlike: 1,
  viewer: 10,
  createdTime: new Date("2024-01-01"),
};

const NOTE_WITHOUT_WRITER_IMAGE = {
  ...NOTE_WITH_IMAGE,
  noteId: 2,
  writerImage: null,
};

const PAGE_UTIL = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 1,
  pageSize: 10,
  hasNext: false,
  hasPrevious: false,
};

describe("TastingNote API", () => {
  let app: Elysia;
  let validToken: string;

  beforeAll(async () => {
    app = createTestApp();
    validToken = await createTestToken(app, 1);
  });

  // ===== 테이스팅 노트 단건 조회 =====

  describe("GET /api/v1/notes/:noteId", () => {
    test("일반 alcohol 노트를 조회할 수 있다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNoteById: mock(async () => ({ ...BASE_NOTE, alcoholId: 42 })),
          incrementViewCount: mock(async () => {}),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/1", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.alcoholId).toBe(42);
      expect(body.alcoholName).toBe("글렌피딕 12년");
    });

    test("custom alcohol 노트(alcoholId가 null)를 조회할 수 있다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNoteById: mock(async () => ({
            ...BASE_NOTE,
            alcoholId: null,
            alcoholName: "직접입력술",
            alcoholCategory: "기타",
          })),
          incrementViewCount: mock(async () => {}),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/2", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.alcoholId).toBeNull();
      expect(body.alcoholName).toBe("직접입력술");
      expect(body.alcoholCategory).toBe("기타");
    });

    test("존재하지 않는 노트 조회 시 404를 반환한다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNoteById: mock(async () => null),
          incrementViewCount: mock(async () => {}),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/9999", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(404);
    });
  });

  // ===== 테이스팅 노트 목록 조회 =====

  describe("GET /api/v1/notes", () => {
    const listResponse = {
      notes: [
        {
          noteId: 1,
          noteTitle: "테스트 노트",
          alcoholCategory: "위스키",
          alcoholName: "글렌피딕 12년",
          noteImage: "",
          writer: "테스터",
          writerImage: null,
          commentNum: 0,
          like: 0,
          unlike: 0,
          viewer: 0,
          createdTime: new Date(),
        },
      ],
      pageUtil: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      },
    };

    test("노트 목록을 조회할 수 있다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNotes: mock(async () => listResponse),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes).toHaveLength(1);
    });

    test("custom alcohol 노트도 목록에 포함된다", async () => {
      const customNoteList = {
        ...listResponse,
        notes: [
          {
            ...listResponse.notes[0],
            alcoholName: "직접입력술",
            alcoholCategory: "기타",
          },
        ],
      };

      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNotes: mock(async () => customNoteList),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].alcoholName).toBe("직접입력술");
    });
  });

  // ===== 테이스팅 노트 작성 =====

  describe("POST /api/v1/notes", () => {
    const baseBody = {
      title: "새 노트",
      content: null,
      createdTime: new Date().toISOString(),
      aroma_note: { 과일: { 사과: 3 } },
      palate_note: {},
      finish_note: {},
      images: [],
    };

    test("alcoholId로 노트를 작성할 수 있다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          createNote: mock(async () => ({ success: true, id: 1 })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${validToken}`,
          },
          body: JSON.stringify({ ...baseBody, alcoholId: 42 }),
        }),
      );

      expect(response.status).toBe(201);
    });

    test("customAlcohol로 노트를 작성할 수 있다", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          createNote: mock(async () => ({ success: true, id: 2 })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${validToken}`,
          },
          body: JSON.stringify({
            ...baseBody,
            customAlcohol: { name: "직접입력술", category: "기타" },
          }),
        }),
      );

      expect(response.status).toBe(201);
    });

    test("인증 없이 작성 시 401을 반환한다", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...baseBody, alcoholId: 1 }),
        }),
      );

      expect(response.status).toBe(401);
    });
  });
});

describe("TastingNote - writerImage in list responses", () => {
  let app: Elysia;
  let validToken: string;

  beforeAll(async () => {
    app = createTestApp();
    validToken = await createTestToken(app, 1);
  });

  describe("GET /api/v1/notes - 전체 목록", () => {
    test("should include writerImage in each note", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNotes: mock(async () => ({ notes: [NOTE_WITH_IMAGE], pageUtil: PAGE_UTIL })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBe("https://example.com/profile.jpg");
    });

    test("should return null writerImage when user has no profile image", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNotes: mock(async () => ({ notes: [NOTE_WITHOUT_WRITER_IMAGE], pageUtil: PAGE_UTIL })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBeNull();
    });

    test("should reflect updated profile image", async () => {
      const updatedUrl = "https://example.com/updated-profile.jpg";

      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getNotes: mock(async () => ({
            notes: [{ ...NOTE_WITH_IMAGE, writerImage: updatedUrl }],
            pageUtil: PAGE_UTIL,
          })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBe(updatedUrl);
    });
  });

  describe("GET /api/v1/notes/hot - 인기 목록", () => {
    test("should include writerImage in each note", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getHotNotes: mock(async () => ({ notes: [NOTE_WITH_IMAGE] })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/hot", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBe("https://example.com/profile.jpg");
    });

    test("should return null writerImage when user has no profile image", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getHotNotes: mock(async () => ({ notes: [NOTE_WITHOUT_WRITER_IMAGE] })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/hot", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBeNull();
    });
  });

  describe("GET /api/v1/notes/best/:alcoholId - 베스트 목록", () => {
    test("should include writerImage in each note", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getBestNotes: mock(async () => ({ notes: [NOTE_WITH_IMAGE] })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/best/1", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBe("https://example.com/profile.jpg");
    });

    test("should return null writerImage when user has no profile image", async () => {
      mock.module("../src/modules/tastingnote/service", () => ({
        TastingNote: {
          getBestNotes: mock(async () => ({ notes: [NOTE_WITHOUT_WRITER_IMAGE] })),
        },
      }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/notes/best/1", {
          headers: { Cookie: `accessToken=${validToken}` },
        }),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.notes[0].writerImage).toBeNull();
    });
  });
});
