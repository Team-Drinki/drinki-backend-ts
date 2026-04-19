import { db } from "../plugins/database";
import {
  users,
  alcoholCategories,
  alcoholLocations,
  alcoholStyles,
  alcohols,
  tastingNotes,
  comments,
  reactions,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. 테스트 사용자 생성
    const userResult = await db
      .insert(users)
      .values({
        socialType: "google",
        socialId: "google_123456",
        nickname: "위스키러버",
        profileImageUrl: "https://via.placeholder.com/150",
        role: "USER",
      })
      .returning();

    if (!userResult[0]) {
      throw new Error("Failed to create user");
    }
    const user = userResult[0];
    console.log("✅ Created user:", user.nickname);

    // 2. 카테고리 생성 (description 없음)
    const categories = await db
      .insert(alcoholCategories)
      .values([
        { name: "위스키" },
        { name: "맥주" },
        { name: "와인" },
        { name: "소주" },
        { name: "막걸리" },
        { name: "사케" },
        { name: "기타" },
      ])
      .returning();

    if (!categories.length) {
      throw new Error("Failed to create categories");
    }
    console.log("✅ Created", categories.length, "categories");

    // 3. 스타일 생성 (categoryId 필요)
    const styles = await db
      .insert(alcoholStyles)
      .values([
        { categoryId: categories[0]!.id, name: "싱글몰트" }, // 위스키 스타일
        { categoryId: categories[0]!.id, name: "블렌디드" }, // 위스키 스타일
        { categoryId: categories[1]!.id, name: "IPA" }, // 맥주 스타일
        { categoryId: categories[1]!.id, name: "라거" }, // 맥주 스타일
        { categoryId: categories[2]!.id, name: "레드와인" }, // 와인 스타일
        { categoryId: categories[2]!.id, name: "화이트와인" }, // 와인 스타일
        { categoryId: categories[3]!.id, name: "증류식" }, // 소주 스타일
        { categoryId: categories[3]!.id, name: "희석식" }, // 소주 스타일
      ])
      .returning();

    if (!styles.length) {
      throw new Error("Failed to create styles");
    }
    console.log("✅ Created", styles.length, "styles");

    // 4. 지역 생성 (country 없음)
    const locations = await db
      .insert(alcoholLocations)
      .values([
        { name: "스코틀랜드" },
        { name: "아일랜드" },
        { name: "켄터키" },
        { name: "보르도" },
        { name: "나파밸리" },
        { name: "서울" },
        { name: "안동" },
        { name: "교토" },
      ])
      .returning();

    if (!locations.length) {
      throw new Error("Failed to create locations");
    }
    console.log("✅ Created", locations.length, "locations");

    // 5. 술 데이터 생성
    const alcoholData = [
      {
        userId: user.id,
        categoryId: categories[0]!.id, // 위스키
        styleId: styles[0]!.id, // 싱글몰트
        locationId: locations[0]!.id, // 스코틀랜드
        name: "글렌피딕 12년",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 65000,
        proof: 40,
        rating: 4.2,
        wishCnt: 150,
        viewCnt: 1200,
        noteCnt: 45,
        content:
          "스코틀랜드의 대표적인 싱글몰트 위스키. 부드럽고 과일향이 특징적입니다.",
      },
      {
        userId: user.id,
        categoryId: categories[0]!.id, // 위스키
        styleId: styles[0]!.id, // 싱글몰트
        locationId: locations[0]!.id, // 스코틀랜드
        name: "맥캘란 18년",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 450000,
        proof: 43,
        rating: 4.8,
        wishCnt: 320,
        viewCnt: 2500,
        noteCnt: 89,
        content: "쉐리 오크통에서 숙성한 프리미엄 싱글몰트 위스키",
      },
      {
        userId: user.id,
        categoryId: categories[1]!.id, // 맥주
        styleId: styles[2]!.id, // IPA
        locationId: locations[2]!.id, // 켄터키
        name: "구스 IPA",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 5000,
        proof: 5.9,
        rating: 3.8,
        wishCnt: 80,
        viewCnt: 600,
        noteCnt: 22,
        content: "홉의 쌉쌀함과 시트러스 향이 조화로운 미국식 IPA",
      },
      {
        userId: user.id,
        categoryId: categories[2]!.id, // 와인
        styleId: styles[4]!.id, // 레드와인
        locationId: locations[3]!.id, // 보르도
        name: "샤토 마고 2015",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 1200000,
        proof: 13.5,
        rating: 4.9,
        wishCnt: 450,
        viewCnt: 3200,
        noteCnt: 120,
        content: "보르도 1등급 그랑크뤼. 복합적이고 우아한 맛의 정점",
      },
      {
        userId: user.id,
        categoryId: categories[3]!.id, // 소주
        styleId: styles[7]!.id, // 희석식
        locationId: locations[5]!.id, // 서울
        name: "참이슬 후레쉬",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 2000,
        proof: 17,
        rating: 3.5,
        wishCnt: 40,
        viewCnt: 800,
        noteCnt: 15,
        content: "대한민국 대표 소주. 깔끔하고 부드러운 목넘김",
      },
      {
        userId: user.id,
        categoryId: categories[3]!.id, // 소주
        styleId: styles[6]!.id, // 증류식
        locationId: locations[6]!.id, // 안동
        name: "안동소주 일품",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 28000,
        proof: 40,
        rating: 4.3,
        wishCnt: 95,
        viewCnt: 720,
        noteCnt: 28,
        content: "전통 증류 방식으로 만든 프리미엄 안동소주",
      },
      {
        userId: user.id,
        categoryId: categories[4]!.id, // 막걸리
        styleId: styles[7]!.id, // 희석식 (막걸리용 스타일이 없어서 임시)
        locationId: locations[5]!.id, // 서울
        name: "복순도가 손막걸리",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 4000,
        proof: 6,
        rating: 4.1,
        wishCnt: 65,
        viewCnt: 520,
        noteCnt: 18,
        content: "100% 국산 쌀로 빚은 프리미엄 생막걸리",
      },
      {
        userId: user.id,
        categoryId: categories[5]!.id, // 사케
        styleId: styles[7]!.id, // 희석식 (사케용 스타일이 없어서 임시)
        locationId: locations[7]!.id, // 교토
        name: "다이긴조 하쿠츠루",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 85000,
        proof: 15,
        rating: 4.5,
        wishCnt: 110,
        viewCnt: 890,
        noteCnt: 35,
        content: "50% 이상 정미한 쌀로 만든 최고급 다이긴조 사케",
      },
      {
        userId: user.id,
        categoryId: categories[0]!.id, // 위스키
        styleId: styles[1]!.id, // 블렌디드
        locationId: locations[0]!.id, // 스코틀랜드
        name: "조니워커 블루",
        imageUrl: "https://via.placeholder.com/300x400",
        price: 250000,
        proof: 40,
        rating: 4.7,
        wishCnt: 200,
        viewCnt: 1800,
        noteCnt: 30,
        content: "조니워커 가문의 정점에 있는 프리미엄 블렌디드 위스키",
      },
    ];

    const createdAlcohols = await db
      .insert(alcohols)
      .values(alcoholData)
      .returning();
    console.log("✅ Created", createdAlcohols.length, "alcohols");

    // 6. 테이스팅 노트 생성
    const notes = await db
      .insert(tastingNotes)
      .values([
        {
          userId: user.id,
          alcoholId: createdAlcohols[0]!.id, // 글렌피딕
          title: "글렌피딕 12년 첫 시음",
          aromaNote: { 과일: { 사과: 4, 배: 3 }, 꽃: { 바닐라: 2 } },
          palateNote: { 단맛: { 꿀: 4 }, 스파이시: { 후추: 2 } },
          finishNote: { 길이: { 중간: 3 } },
          images: ["https://via.placeholder.com/300x300"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: user.id,
          alcoholId: createdAlcohols[1]!.id, // 맥캘란
          title: "맥캘란 18년 역시 최고",
          aromaNote: { 과일: { 말린과일: 5 }, 오크: { 쉐리: 5 } },
          palateNote: { 바디감: { 묵직함: 4 }, 단맛: { 초콜릿: 3 } },
          finishNote: { 길이: { 김: 5 } },
          images: ["https://via.placeholder.com/300x300"],
          createdAt: new Date(Date.now() - 86400000), // 어제
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          userId: user.id,
          alcoholId: createdAlcohols[0]!.id, // 글렌피딕
          title: "글렌피딕 데일리로 좋네요",
          aromaNote: { 과일: { 청사과: 4 } },
          palateNote: { 가벼움: { 깔끔함: 4 } },
          finishNote: { 길이: { 짧음: 2 } },
          images: [],
          createdAt: new Date(Date.now() - 172800000), // 그저께
          updatedAt: new Date(Date.now() - 172800000),
        },
        {
          userId: user.id,
          alcoholId: createdAlcohols[8]!.id, // 조니워커 블루
          title: "조니워커 블루 - 영원한 클래식",
          aromaNote: { 과일: { 오렌지: 4 }, 꽃: { 헤더: 3 }, 오크: { 쉐리: 4 } },
          palateNote: { 단맛: { 꿀: 5, 바닐라: 4 }, 스파이시: { 정향: 2 } },
          finishNote: { 길이: { 김: 5 } },
          images: ["https://via.placeholder.com/300x300"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .returning();
    console.log("✅ Created", notes.length, "tasting notes");

    // 7. 댓글 생성
    if (notes.length > 0) {
      await db.insert(comments).values([
        {
          userId: user.id,
          targetType: "tasting_note",
          targetId: notes[0]!.id,
          body: "저도 이거 좋아해요!",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: user.id,
          targetType: "tasting_note",
          targetId: notes[1]!.id,
          body: "가격이 좀 비싸긴 하죠 ㅠㅠ",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("✅ Created comments");

      // 8. 리액션 생성 (좋아요)
      await db.insert(reactions).values([
        {
          userId: user.id,
          targetType: "tasting_note",
          targetId: notes[0]!.id,
          reactionType: "like",
          createdAt: new Date(),
        },
        {
          userId: user.id,
          targetType: "tasting_note",
          targetId: notes[1]!.id,
          reactionType: "like",
          createdAt: new Date(),
        },
      ]);
      console.log("✅ Created reactions");
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📌 Test user info:");
    console.log("   - Nickname:", user.nickname);
    console.log("   - Social Type:", user.socialType);
    console.log("   - Role:", user.role);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// 실행
seed();
