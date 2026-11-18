export type AssistantResponse = {
  title: string;
  source?: string;
  intro?: string;
  steps?: { title: string; text: string }[];
  sample?: string;
  note?: string;
  links?: { label: string; href: string }[];
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

// Local guidance only: links lead to live project pages; no invented results or schedules.
export function getAssistantResponse(
  input: string,
  language: string,
): AssistantResponse {
  const vi = language === "vi";
  const text = normalize(input);
  const has = (...terms: string[]) => terms.some((term) => text.includes(term));
  const link = (path: string, labelVi: string, labelEn: string) => ({
    href: `/${vi ? "vi" : "en"}${path}`,
    label: vi ? labelVi : labelEn,
  });
  const creator = link(
    "/creator-lab",
    "Khám phá Creator Lab",
    "Explore Creator Lab",
  );
  const sports = link(
    "/sports",
    "Bộ môn & Thương tật",
    "Sports & Classifications",
  );
  const clubs = link("/clubs", "Tìm câu lạc bộ", "Find a club");
  const news = link("/news", "Đọc tin tức & sự kiện", "Read news & events");
  const pityWords = [
    "dang thuong",
    "toi nghiep",
    "vuot len so phan",
    "bat hanh",
    "du khuyet tat",
    "pity",
    "disabled but",
    "misfortune",
  ];
  const reviewing = has("kiem tra", "ra soat", "check", "review");
  if (pityWords.some((word) => text.includes(word))) {
    return {
      title: vi
        ? "Góp ý cách kể chuyện tôn trọng"
        : "Tell the story with respect",
      intro: vi
        ? "Đoạn bạn gửi có cách diễn đạt có thể gợi thương hại. Hãy đặt năng lực, mục tiêu và trải nghiệm thể thao của nhân vật ở trung tâm."
        : "Some wording may invite pity. Focus on the person’s skills, goals and sporting experience.",
      steps: [
        {
          title: vi ? "Tập trung vào hành động" : "Focus on action",
          text: vi
            ? "Kể về buổi tập, kỹ thuật đang rèn luyện hoặc mục tiêu thi đấu cụ thể."
            : "Describe training, a skill in progress or a specific competition goal.",
        },
        {
          title: vi
            ? "Tôn trọng tiếng nói của vận động viên"
            : "Respect the athlete’s voice",
          text: vi
            ? "Dùng lời chia sẻ thật; xin phép trước khi đăng hình ảnh hoặc thông tin cá nhân."
            : "Use authentic quotes and ask before sharing images or personal information.",
        },
      ],
      sample: vi
        ? "Hôm nay, tôi tiếp tục hoàn thiện [kỹ thuật] cùng huấn luyện viên tại [CLB]. Mục tiêu của tôi là [mục tiêu thực tế]. Cảm ơn những người đồng đội đã cùng tôi tiến bộ qua từng buổi tập. #VietnamParaSports"
        : "Today I worked on [skill] with my coach at [club]. My goal is [realistic goal]. Thank you to my teammates for helping me improve at every session. #VietnamParaSports",
      note: vi
        ? "Đây là góp ý theo từ khóa, chưa phải đánh giá đầy đủ ngữ cảnh."
        : "This is keyword-based guidance, not a complete contextual review.",
      links: [creator],
    };
  }
  if (reviewing)
    return {
      title: vi ? "Cùng rà soát caption của bạn" : "Review your caption",
      intro: vi
        ? "Bạn có thể gửi đoạn caption cần xem lại. Trước khi đăng, hãy kiểm tra ba điểm sau:"
        : "Share the caption you want to review. Before posting, check these three points:",
      steps: [
        {
          title: vi ? "Thông tin chính xác" : "Accuracy",
          text: vi
            ? "Tên bộ môn, sự kiện, địa điểm và thành tích phải có nguồn xác nhận."
            : "Verify the sport, event, venue and achievements.",
        },
        {
          title: vi ? "Ngôn ngữ tôn trọng" : "Respectful language",
          text: vi
            ? "Nhấn mạnh kỹ năng và nỗ lực, tránh bi kịch hóa khuyết tật."
            : "Highlight skills and effort without dramatizing disability.",
        },
        {
          title: vi ? "Quyền riêng tư" : "Privacy",
          text: vi
            ? "Chỉ sử dụng hình ảnh và thông tin cá nhân khi đã được đồng ý."
            : "Only share images and personal details with consent.",
        },
      ],
      links: [creator],
    };
  if (
    has(
      "caption",
      "bio",
      "self-intro",
      "gioi thieu ban than",
      "gioi thieu van dong vien",
    )
  )
    return {
      title: vi
        ? "Caption giới thiệu vận động viên"
        : "Athlete introduction caption",
      intro: vi
        ? "Một bản nháp theo tinh thần Vietnam ParaSports: chân thực, tự tin và tập trung vào hành trình thể thao."
        : "A Vietnam ParaSports draft: authentic, confident and focused on the sporting journey.",
      sample: vi
        ? "Xin chào, mình là [Tên], đang tập luyện môn [Bộ môn] tại [CLB/Tỉnh, thành].\n\nMỗi buổi tập là dịp để mình hoàn thiện kỹ năng và tiến gần hơn đến [Mục tiêu thực tế]. Mình mong được chia sẻ những khoảnh khắc tập luyện, thi đấu và gặp gỡ những người cùng yêu thể thao.\n\nCùng theo dõi và đồng hành với mình trên Vietnam ParaSports nhé!\n#VietnamParaSports #VietnamCreatorLab #TheThaoKhongRaoCan"
        : "Hi, I’m [Name], training in [Sport] at [Club/City].\n\nEvery session helps me build my skills and work towards [Realistic goal]. I look forward to sharing training, competitions and connections with others who love sport.\n\nFollow my journey with Vietnam ParaSports!\n#VietnamParaSports #VietnamCreatorLab",
      note: vi
        ? "Thay các phần trong ngoặc vuông bằng thông tin thật. Chỉ thêm thành tích đã được xác nhận."
        : "Replace the placeholders with real details. Include only verified achievements.",
      links: [creator, clubs],
    };
  if (has("video", "kich ban", "hanh trinh", "journey", "script"))
    return {
      title: vi
        ? "Kịch bản 30–45 giây: Một buổi tập của tôi"
        : "30–45 second script: My training session",
      intro: vi
        ? "Gợi ý từ Creator Lab, ưu tiên kỹ năng và góc nhìn của người tập."
        : "A Creator Lab outline centred on skills and the athlete’s perspective.",
      steps: [
        {
          title: vi ? "0–10 giây · Giới thiệu" : "0–10 seconds · Introduce",
          text: vi
            ? "Quay chuẩn bị dụng cụ. Lời dẫn: “Mình là [Tên], hôm nay cùng mình tập [Bộ môn] tại [CLB] nhé.”"
            : "Film equipment preparation. Voiceover: “I’m [Name]. Join my [Sport] session at [Club].”",
        },
        {
          title: vi ? "10–30 giây · Một kỹ năng" : "10–30 seconds · One skill",
          text: vi
            ? "Ghi lại một động tác theo hướng dẫn của HLV và chia sẻ điều bạn đang cải thiện."
            : "Show one coach-guided movement and explain what you are improving.",
        },
        {
          title: vi ? "30–45 giây · Kết nối" : "30–45 seconds · Connect",
          text: vi
            ? "Kết bằng mục tiêu buổi tập tiếp theo và mời người xem theo dõi hành trình trên Vietnam ParaSports."
            : "Close with your next training goal and invite viewers to follow your Vietnam ParaSports journey.",
        },
      ],
      note: vi
        ? "Xin phép người xuất hiện trong video; thêm phụ đề để nội dung dễ tiếp cận hơn."
        : "Get permission from anyone filmed and add captions for accessibility.",
      links: [creator],
    };
  if (has("y tuong", "idea", "tuan", "week"))
    return {
      title: vi
        ? "Ý tưởng nội dung cho cộng đồng ParaSports"
        : "Content ideas for the ParaSports community",
      steps: [
        {
          title: vi ? "Một kỹ năng, một tiến bộ" : "One skill, one improvement",
          text: vi
            ? "Chia sẻ kỹ thuật bạn đang rèn luyện và điều học được từ HLV."
            : "Share a skill you are practising and a lesson from your coach.",
        },
        {
          title: vi ? "Gặp gỡ câu lạc bộ" : "Meet your club",
          text: vi
            ? "Giới thiệu không gian tập, đồng đội và cách tham gia CLB bằng thông tin đã xác nhận."
            : "Introduce your venue, teammates and verified joining information.",
        },
        {
          title: vi ? "Câu chuyện sau buổi tập" : "After training",
          text: vi
            ? "Kể một trải nghiệm thật, một mục tiêu mới hoặc lời cảm ơn người đồng hành."
            : "Tell a genuine story, share a new goal or thank a supporter.",
        },
      ],
      note: vi
        ? "Có thể dùng ba chủ đề cho ba bài đăng trong tuần; thay đổi theo lịch tập thực tế."
        : "Use these as three weekly posts, adapted to your actual schedule.",
      links: [creator, news],
    };
  if (has("thuong tat", "phan hang", "classification", "disability"))
    return {
      title: vi
        ? "Tìm hiểu bộ môn và hạng thương tật"
        : "Explore sports and classifications",
      intro: vi
        ? "Tại mục Bộ môn & Thương tật, chọn “Thương tật” để xem mã hạng, mô tả chức năng và thông tin theo từng môn."
        : "Open Sports & Classifications and select Classifications to browse codes and sport-specific descriptions.",
      note: vi
        ? "Thông tin trên trang dùng để tham khảo. Phân hạng thi đấu cần hội đồng chuyên môn xác nhận; trợ lý không kết luận hạng của cá nhân."
        : "The directory is informational. Competition classification requires qualified classifiers; this assistant cannot classify an individual.",
      links: [sports],
    };
  if (has("clb", "cau lac bo", "noi tap", "club", "training venue"))
    return {
      title: vi ? "Tìm nơi tập luyện và cộng đồng" : "Find a place to train",
      steps: [
        {
          title: vi ? "Chọn khu vực và bộ môn" : "Choose location and sport",
          text: vi
            ? "Mở danh sách CLB, dùng bộ lọc khu vực, bộ môn hoặc tìm theo tên."
            : "Use the club directory’s location, sport and name filters.",
        },
        {
          title: vi ? "Xem thông tin chi tiết" : "Read the club details",
          text: vi
            ? "Kiểm tra địa điểm, lịch tập, đối tượng phù hợp và cách liên hệ được CLB công bố."
            : "Check the published venue, schedule, eligibility and contact details.",
        },
        {
          title: vi ? "Liên hệ trước khi đến" : "Contact the club",
          text: vi
            ? "Xác nhận lịch, học phí và điều kiện tham gia trực tiếp với CLB."
            : "Confirm availability, fees and joining requirements directly with the club.",
        },
      ],
      links: [clubs],
    };
  if (
    has(
      "tin tuc",
      "su kien",
      "giai dau",
      "lich thi dau",
      "news",
      "event",
      "match",
      "tournament",
    )
  )
    return {
      title: vi
        ? "Theo dõi nhịp đập ParaSports"
        : "Follow the ParaSports community",
      intro: vi
        ? "Tìm bài viết theo từ khóa hoặc chuyên mục tại Tin tức & Sự kiện. Mỗi trang bộ môn cũng có phần tin tức và hoạt động liên quan."
        : "Search News & Events by keyword or category. Sport pages also collect related stories and activities.",
      note: vi
        ? "Trợ lý không tra cứu dữ liệu trực tiếp trong cuộc trò chuyện; hãy mở các trang bên dưới để xem thông tin hiện có."
        : "This chat does not retrieve live records. Open the pages below for current information.",
      links: [
        news,
        sports,
        link("/matches", "Xem lịch thi đấu", "View fixtures"),
      ],
    };
  if (
    has(
      "creator",
      "khoa hoc",
      "tai lieu",
      "capcut",
      "course",
      "document",
      "learn",
    )
  )
    return {
      title: "Vietnam Creator Lab",
      intro: vi
        ? "Không gian học tập và sáng tạo nội dung dành cho cộng đồng thể thao người khuyết tật trên Vietnam ParaSports."
        : "Vietnam ParaSports’ learning and content creation space for the disability sports community.",
      steps: [
        {
          title: vi ? "Học điều mới" : "Learn something new",
          text: vi
            ? "Khám phá các khóa học hiện có trong thư viện."
            : "Explore courses available in the library.",
        },
        {
          title: vi ? "Tạo dấu ấn riêng" : "Make your mark",
          text: vi
            ? "Tham khảo tài liệu, kịch bản và mẫu CapCut cho nội dung của bạn."
            : "Use documents, script ideas and CapCut templates for your content.",
        },
        {
          title: vi ? "Lan tỏa giá trị" : "Share your story",
          text: vi
            ? "Kể câu chuyện thể thao bằng trải nghiệm và tiếng nói của chính bạn."
            : "Tell your sporting story through your own experience and voice.",
        },
      ],
      links: [creator],
    };
  if (has("bo mon", "the thao", "sport"))
    return {
      title: vi ? "Khám phá các bộ môn" : "Explore the sports",
      intro: vi
        ? "Mở danh mục Bộ môn & Thương tật, tìm tên môn và chọn “Khám phá bộ môn” để xem giới thiệu, tin tức, học liệu và câu lạc bộ liên quan."
        : "Search the sports directory and open a sport to discover its introduction, stories, learning resources and clubs.",
      links: [sports, clubs],
    };
  return {
    title: vi ? "Tôi có thể hỗ trợ gì cho bạn?" : "How can I help?",
    intro: vi
      ? "Tôi hỗ trợ tìm đường đến các nội dung của Vietnam ParaSports và gợi ý truyền thông theo tinh thần Creator Lab."
      : "I help you navigate Vietnam ParaSports and draft content in the Creator Lab spirit.",
    steps: [
      {
        title: vi ? "Khám phá & kết nối" : "Explore & connect",
        text: vi
          ? "Tìm bộ môn, tra cứu thông tin phân hạng và khám phá CLB."
          : "Find sports, classification information and clubs.",
      },
      {
        title: vi ? "Học tập & sáng tạo" : "Learn & create",
        text: vi
          ? "Gợi ý caption, kịch bản video và ý tưởng kể chuyện thể thao."
          : "Get caption drafts, video outlines and sporting story ideas.",
      },
      {
        title: vi ? "Theo dõi cộng đồng" : "Follow the community",
        text: vi
          ? "Dẫn tới tin tức, sự kiện và hoạt động trên nền tảng."
          : "Find news, events and activities on the platform.",
      },
    ],
    links: [sports, clubs, creator, news],
  };
}
