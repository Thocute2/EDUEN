import { WorkplaceScenario } from "@/types/dictionary";

// Curated workplace dialogues for high-frequency professional & business vocabulary
const CURATED_SCENARIOS: Record<string, WorkplaceScenario> = {
  benchmark: {
    title: "Quarterly Performance & Tech Review",
    titleVi: "Đánh Giá Hiệu Suất & Đối Chuẩn Kỹ Thuật Hàng Quý",
    contextDescription:
      "The Product Manager and Lead Engineer discuss system reliability and compare their team's SLAs against international fintech standards.",
    contextDescriptionVi:
      "Giám đốc Sản phẩm và Kỹ sư Trưởng thảo luận về độ tin cậy hệ thống và so sánh chỉ số cam kết SLA với tiêu chuẩn fintech quốc tế.",
    dialogue: [
      {
        speaker: "Alex",
        role: "Product Manager",
        line: "Our enterprise clients are requesting 99.99% uptime. How do our current metrics compare?",
        lineVi: "Các khách hàng doanh nghiệp đang yêu cầu thời gian hoạt động 99.99%. Các chỉ số hiện tại của chúng ta so với yêu cầu ra sao?",
      },
      {
        speaker: "Sarah",
        role: "Lead Engineer",
        line: "We used AWS top-tier services as a benchmark. Right now, our response latency is 15% better than the industry benchmark.",
        lineVi: "Chúng ta đã dùng dịch vụ hàng đầu của AWS làm điểm chuẩn. Hiện tại, độ trễ phản hồi của chúng ta tốt hơn 15% so với mức chuẩn ngành.",
      },
      {
        speaker: "Alex",
        role: "Product Manager",
        line: "That is great news. Let's document this benchmark in our investor pitch deck.",
        lineVi: "Đó là tin rất tốt. Hãy đưa mốc điểm chuẩn này vào bản thuyết trình kêu gọi nhà đầu tư.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=benchmark+business+english+in+workplace",
    youGlishUrl: "https://youglish.com/pronounce/benchmark/english",
  },
  delegate: {
    title: "Sprint Planning & Resource Allocation",
    titleVi: "Lập Kế Hoạch Sprint & Phân Bổ Nguồn Lực",
    contextDescription:
      "An Engineering Manager talks with a Senior Developer about balancing workloads and empowering junior engineers.",
    contextDescriptionVi:
      "Quản lý Kỹ thuật trao đổi với Lập trình viên Cấp cao về việc cân bằng khối lượng công việc và trao quyền cho các kỹ sư trẻ.",
    dialogue: [
      {
        speaker: "Marcus",
        role: "Engineering Manager",
        line: "You're handling both the architecture redesign and daily bug triaging. It's time to delegate some tasks.",
        lineVi: "Bạn đang ôm cả việc tái cấu trúc kiến trúc lẫn xử lý lỗi hàng ngày. Đã đến lúc phải giao bớt việc cho người khác rồi.",
      },
      {
        speaker: "Elena",
        role: "Senior Developer",
        line: "I was worried about code quality, but you're right. I will delegate the UI regression tests to David.",
        lineVi: "Tôi từng lo về chất lượng mã, nhưng anh nói đúng. Tôi sẽ ủy quyền phần kiểm thử giao diện cho David.",
      },
      {
        speaker: "Marcus",
        role: "Engineering Manager",
        line: "Excellent. Delegating effectively will give you time to focus on strategic deliverables.",
        lineVi: "Tuyệt vời. Giao việc hiệu quả sẽ giúp bạn có đủ thời gian tập trung vào các hạng mục chiến lược.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=delegate+tasks+workplace+conversation",
    youGlishUrl: "https://youglish.com/pronounce/delegate/english",
  },
  bottleneck: {
    title: "Cross-Functional Pipeline Sync",
    titleVi: "Họp Đồng Bộ Quy Trình Phối Hợp Đa Bộ Phận",
    contextDescription:
      "Operations Lead and DevOps Engineer identify why release cycles have slowed down during peak deployment.",
    contextDescriptionVi:
      "Trưởng nhóm Vận hành và Kỹ sư DevOps cùng phân tích lý do chu kỳ phát hành sản phẩm bị chậm trễ trong đợt cao điểm.",
    dialogue: [
      {
        speaker: "Rachel",
        role: "Operations Lead",
        line: "The QA verification stage seems to be the primary bottleneck in our two-week release cycle.",
        lineVi: "Khâu xác thực kiểm thử QA có vẻ đang là điểm nghẽn chính trong chu kỳ phát hành hai tuần của chúng ta.",
      },
      {
        speaker: "Kenji",
        role: "DevOps Engineer",
        line: "We can eliminate that bottleneck by parallelizing our automated integration suite across multiple runners.",
        lineVi: "Chúng ta có thể giải quyết nút thắt đó bằng cách chạy song song bộ tích hợp tự động trên nhiều máy chủ.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=bottleneck+business+management",
    youGlishUrl: "https://youglish.com/pronounce/bottleneck/english",
  },
  stakeholder: {
    title: "Executive Alignment Meeting",
    titleVi: "Cuộc Họp Thống Nhất Chiến Lược Cấp Điều Hành",
    contextDescription:
      "A Project Director aligns key deliverables with the regional VP before the annual shareholder briefing.",
    contextDescriptionVi:
      "Giám đốc Dự án thống nhất các hạng mục bàn giao chính với Phó Chủ tịch Khu vực trước buổi báo cáo cổ đông thường niên.",
    dialogue: [
      {
        speaker: "Victoria",
        role: "Project Director",
        line: "All major internal stakeholders have signed off on the revised timeline.",
        lineVi: "Tất cả các bên liên quan nội bộ chủ chốt đều đã ký duyệt mốc tiến độ điều chỉnh.",
      },
      {
        speaker: "Julian",
        role: "VP of Operations",
        line: "Make sure we also keep external stakeholders in the loop before the press release next Monday.",
        lineVi: "Hãy đảm bảo chúng ta cũng thông báo liên tục cho các bên liên quan bên ngoài trước thông cáo báo chí vào thứ Hai tới.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=stakeholder+communication+business+english",
    youGlishUrl: "https://youglish.com/pronounce/stakeholder/english",
  },
  synergy: {
    title: "Post-Merger Integration Workshop",
    titleVi: "Hội Thảo Hợp Nhất Sau Mua Bán Sáp Nhập",
    contextDescription:
      "Department heads brainstorm how to combine marketing and sales pipelines to maximize cross-sell revenue.",
    contextDescriptionVi:
      "Các trưởng bộ phận bàn bạc cách kết hợp dữ liệu tiếp thị và bán hàng nhằm tối đa hóa doanh thu bán chéo.",
    dialogue: [
      {
        speaker: "Diana",
        role: "Chief Commercial Officer",
        line: "By unifying customer data across both platforms, we can unlock tremendous commercial synergy.",
        lineVi: "Bằng việc thống nhất dữ liệu khách hàng trên cả hai nền tảng, chúng ta có thể mở khóa sức mạnh cộng hưởng thương mại to lớn.",
      },
      {
        speaker: "Liam",
        role: "Head of Growth",
        line: "Agreed. Our sales teams will immediately benefit from shared marketing automation tools.",
        lineVi: "Hoàn toàn đồng ý. Đội ngũ bán hàng sẽ hưởng lợi ngay từ việc dùng chung các công cụ tự động hóa tiếp thị.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=synergy+corporate+business+english",
    youGlishUrl: "https://youglish.com/pronounce/synergy/english",
  },
  feasibility: {
    title: "Product Discovery & Technical Assessment",
    titleVi: "Khảo Sát Sản Phẩm & Đánh Giá Khả Thi Kỹ Thuật",
    contextDescription:
      "A Product Owner discusses feasibility studies before committing to a costly machine learning feature.",
    contextDescriptionVi:
      "Trưởng nhóm Sản phẩm thảo luận về nghiên cứu tính khả thi trước khi đầu tư tính năng máy học phức tạp.",
    dialogue: [
      {
        speaker: "Tom",
        role: "Product Owner",
        line: "Have we finalized the technical feasibility report for on-device inference?",
        lineVi: "Chúng ta đã hoàn thiện báo cáo tính khả thi kỹ thuật về việc chạy mô hình trực tiếp trên thiết bị chưa?",
      },
      {
        speaker: "Aisha",
        role: "Data Science Lead",
        line: "Yes, the feasibility study confirmed that lightweight models will run smoothly without draining user battery.",
        lineVi: "Rồi, nghiên cứu khả thi đã khẳng định các mô hình tinh gọn sẽ chạy mượt mà mà không làm hao pin thiết bị người dùng.",
      },
    ],
    videoSearchUrl: "https://www.youtube.com/results?search_query=feasibility+study+business+english",
    youGlishUrl: "https://youglish.com/pronounce/feasibility/english",
  },
};

/**
 * Generate or retrieve a workplace dialogue scenario for a given word
 */
export function getWorkplaceScenario(
  word: string,
  sampleDefinition?: string,
  sampleExample?: string
): WorkplaceScenario {
  const normalized = word.trim().toLowerCase();

  // Return curated scenario if available
  if (CURATED_SCENARIOS[normalized]) {
    return CURATED_SCENARIOS[normalized];
  }

  // Dynamic professional workplace dialogue generation
  const exampleSentence =
    sampleExample ||
    `We need to carefully consider how "${word}" impacts our project deliverables and team collaboration.`;

  return {
    title: `Workplace Context & Team Communication: "${word}"`,
    titleVi: `Hội Thoại Công Sở & Giao Tiếp Nhóm: "${word}"`,
    contextDescription: sampleDefinition
      ? `Discussion in a professional business setting regarding: ${sampleDefinition}`
      : `Team members collaborating in a project meeting applying "${word}" in daily business operations.`,
    contextDescriptionVi: `Các đồng nghiệp trao đổi trong buổi họp dự án, ứng dụng từ "${word}" vào công việc thực tế.`,
    dialogue: [
      {
        speaker: "Colleague A",
        role: "Project Lead",
        line: `In our review today, let's address the role of "${word}" in our current roadmap.`,
        lineVi: `Trong buổi đánh giá hôm nay, chúng ta hãy xem xét vai trò của "${word}" trong lộ trình hiện tại.`,
      },
      {
        speaker: "Colleague B",
        role: "Senior Consultant",
        line: `${exampleSentence}`,
        lineVi: `Chúng ta cần cân nhắc kỹ lưỡng cách thức áp dụng điều này vào các mục tiêu bàn giao của nhóm.`,
      },
      {
        speaker: "Colleague A",
        role: "Project Lead",
        line: `Understood. Let's incorporate that into our meeting summary for the executive team.`,
        lineVi: `Đã rõ. Hãy tổng hợp ý này vào biên bản cuộc họp để báo cáo ban điều hành.`,
      },
    ],
    videoSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      word + " business english pronunciation workplace"
    )}`,
    youGlishUrl: `https://youglish.com/pronounce/${encodeURIComponent(word)}/english`,
  };
}

