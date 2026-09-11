import { WordSuggestion } from "@/types/dictionary";

export interface LexiconEntry {
  vietnamese: string;
  keywords: string[]; // Variations/synonyms in Vietnamese (e.g. ["hợp tác", "cộng tác", "phối hợp"])
  suggestions: WordSuggestion[];
}

export const VIETNAMESE_LEXICON: LexiconEntry[] = [
  {
    vietnamese: "hợp tác",
    keywords: ["hợp tác", "cộng tác", "phối hợp", "làm việc chung"],
    suggestions: [
      {
        word: "collaborate",
        pos: "verb",
        meaningVi: "Cộng tác, làm việc chung trong một dự án hoặc ý tưởng sáng tạo",
        type: "primary",
        badge: "Công sở chuẩn",
      },
      {
        word: "cooperate",
        pos: "verb",
        meaningVi: "Phối hợp, hỗ trợ lẫn nhau để đạt mục đích chung",
        type: "synonym",
        badge: "Phổ biến",
      },
      {
        word: "partner",
        pos: "verb",
        meaningVi: "Liên kết, thiết lập quan hệ đối tác kinh doanh hoặc chiến lược",
        type: "synonym",
        badge: "Kinh doanh",
      },
      {
        word: "synergy",
        pos: "noun",
        meaningVi: "Sức mạnh tổng hợp sinh ra từ sự hợp tác hiệu quả",
        type: "related",
        badge: "Khái niệm",
      },
    ],
  },
  {
    vietnamese: "điểm nghẽn",
    keywords: ["điểm nghẽn", "nút thắt cổ chai", "ách tắc", "chậm trễ", "bế tắc"],
    suggestions: [
      {
        word: "bottleneck",
        pos: "noun",
        meaningVi: "Điểm nghẽn, nút thắt làm chậm toàn bộ tiến độ dự án hoặc quy trình",
        type: "primary",
        badge: "Kinh doanh",
      },
      {
        word: "impasse",
        pos: "noun",
        meaningVi: "Tình thế bế tắc hoàn toàn, không thể thương lượng hay tiến lên",
        type: "synonym",
        badge: "Đàm phán",
      },
      {
        word: "hurdle",
        pos: "noun",
        meaningVi: "Rào cản, thử thách khó khăn cần phải vượt qua",
        type: "synonym",
        badge: "Phổ biến",
      },
      {
        word: "roadblock",
        pos: "noun",
        meaningVi: "Chướng ngại vật lớn cản trở công việc tiếp tục",
        type: "related",
        badge: "Gần nghĩa",
      },
    ],
  },
  {
    vietnamese: "ủy quyền",
    keywords: ["ủy quyền", "ủy thác", "giao việc", "phân quyền", "trao quyền"],
    suggestions: [
      {
        word: "delegate",
        pos: "verb",
        meaningVi: "Phân quyền, giao phó trách nhiệm hoặc công việc cho cấp dưới",
        type: "primary",
        badge: "Quản lý",
      },
      {
        word: "entrust",
        pos: "verb",
        meaningVi: "Giao phó một trọng trách lớn cho người mà bạn hoàn toàn tin tưởng",
        type: "synonym",
        badge: "Nâng cao",
      },
      {
        word: "authorize",
        pos: "verb",
        meaningVi: "Phê chuẩn, cấp quyền chính thức cho ai đó hành động",
        type: "synonym",
        badge: "Chính thức",
      },
      {
        word: "empower",
        pos: "verb",
        meaningVi: "Trao quyền tự quyết và truyền sự tự tin cho nhân viên",
        type: "related",
        badge: "Lãnh đạo",
      },
    ],
  },
  {
    vietnamese: "tính khả thi",
    keywords: ["tính khả thi", "khả thi", "có thể thực hiện", "thực tế"],
    suggestions: [
      {
        word: "feasibility",
        pos: "noun",
        meaningVi: "Tính khả thi, mức độ có thể triển khai thành công trong thực tế",
        type: "primary",
        badge: "Dự án",
      },
      {
        word: "viability",
        pos: "noun",
        meaningVi: "Khả năng tồn tại, phát triển bền vững và sinh lời của kế hoạch",
        type: "synonym",
        badge: "Tài chính",
      },
      {
        word: "practicality",
        pos: "noun",
        meaningVi: "Tính thực tiễn, tính ứng dụng thực tế so với lý thuyết",
        type: "synonym",
        badge: "Phổ biến",
      },
    ],
  },
  {
    vietnamese: "tiêu chuẩn",
    keywords: ["tiêu chuẩn", "chuẩn đối sánh", "thước đo", "mốc so sánh", "chuẩn mực"],
    suggestions: [
      {
        word: "benchmark",
        pos: "noun",
        meaningVi: "Chuẩn đối sánh, tiêu chuẩn vàng dùng làm mốc đánh giá các bên",
        type: "primary",
        badge: "Đánh giá",
      },
      {
        word: "criterion",
        pos: "noun",
        meaningVi: "Tiêu chí cụ thể dùng để xét duyệt, đánh giá một vấn đề",
        type: "synonym",
        badge: "Quy chuẩn",
      },
      {
        word: "standard",
        pos: "noun",
        meaningVi: "Tiêu chuẩn chung được cộng đồng hoặc ngành công nhận",
        type: "synonym",
        badge: "Cơ bản",
      },
      {
        word: "yardstick",
        pos: "noun",
        meaningVi: "Thước đo định lượng để kiểm tra sự tiến bộ",
        type: "related",
        badge: "Hình tượng",
      },
    ],
  },
  {
    vietnamese: "đối tác",
    keywords: ["đối tác", "bên liên quan", "cổ đông", "khách hàng", "các bên"],
    suggestions: [
      {
        word: "stakeholder",
        pos: "noun",
        meaningVi: "Bên liên quan trực tiếp hoặc gián tiếp có lợi ích trong dự án",
        type: "primary",
        badge: "Quản trị",
      },
      {
        word: "partner",
        pos: "noun",
        meaningVi: "Đối tác kinh doanh cùng chia sẻ lợi ích và rủi ro",
        type: "synonym",
        badge: "Kinh doanh",
      },
      {
        word: "shareholder",
        pos: "noun",
        meaningVi: "Cổ đông nắm giữ cổ phần của công ty",
        type: "related",
        badge: "Tài chính",
      },
    ],
  },
  {
    vietnamese: "ngân sách",
    keywords: ["ngân sách", "kinh phí", "chi phí", "vốn", "tài chính"],
    suggestions: [
      {
        word: "budget",
        pos: "noun",
        meaningVi: "Ngân sách, bảng dự toán chi tiêu tài chính cho dự án",
        type: "primary",
        badge: "Kinh doanh",
      },
      {
        word: "allocation",
        pos: "noun",
        meaningVi: "Sự phân bổ, cấp phát nguồn ngân sách hoặc tài nguyên",
        type: "synonym",
        badge: "Kế hoạch",
      },
      {
        word: "expenditure",
        pos: "noun",
        meaningVi: "Khoản chi tiêu thực tế xuất phát từ ngân sách",
        type: "related",
        badge: "Kế toán",
      },
    ],
  },
  {
    vietnamese: "thương lượng",
    keywords: ["thương lượng", "đàm phán", "thỏa hiệp", "ký kết"],
    suggestions: [
      {
        word: "negotiate",
        pos: "verb",
        meaningVi: "Thương lượng, đàm phán các điều khoản để đạt được thỏa thuận",
        type: "primary",
        badge: "Hợp đồng",
      },
      {
        word: "compromise",
        pos: "verb",
        meaningVi: "Thỏa hiệp, nhượng bộ đôi bên để đi đến tiếng nói chung",
        type: "synonym",
        badge: "Giao tiếp",
      },
      {
        word: "mediate",
        pos: "verb",
        meaningVi: "Hòa giải, làm trung gian thương lượng giữa các bên bất đồng",
        type: "related",
        badge: "Nâng cao",
      },
    ],
  },
  {
    vietnamese: "đột phá",
    keywords: ["đột phá", "sáng tạo", "đổi mới", "cải tiến"],
    suggestions: [
      {
        word: "breakthrough",
        pos: "noun",
        meaningVi: "Bước đột phá quan trọng mang lại thành tựu nhảy vọt",
        type: "primary",
        badge: "Thành tựu",
      },
      {
        word: "innovation",
        pos: "noun",
        meaningVi: "Sự đổi mới, sáng kiến cải tiến quy trình hoặc sản phẩm",
        type: "synonym",
        badge: "Công nghệ",
      },
      {
        word: "disrupt",
        pos: "verb",
        meaningVi: "Tạo đột phá mang tính cách mạng, thay đổi luật chơi của ngành",
        type: "related",
        badge: "Xu hướng",
      },
    ],
  },
  {
    vietnamese: "tối ưu hóa",
    keywords: ["tối ưu hóa", "tinh gọn", "cải tiến quy trình", "nâng cao hiệu suất"],
    suggestions: [
      {
        word: "optimize",
        pos: "verb",
        meaningVi: "Tối ưu hóa hiệu năng, giảm thiểu chi phí và thời gian",
        type: "primary",
        badge: "Kỹ thuật",
      },
      {
        word: "streamline",
        pos: "verb",
        meaningVi: "Tinh gọn quy trình làm việc, loại bỏ các bước rườm rà dư thừa",
        type: "synonym",
        badge: "Vận hành",
      },
      {
        word: "fine-tune",
        pos: "verb",
        meaningVi: "Tinh chỉnh chi tiết nhỏ để đạt độ chính xác và hoàn thiện cao nhất",
        type: "related",
        badge: "Chuyên sâu",
      },
    ],
  },
  {
    vietnamese: "tiến độ",
    keywords: ["tiến độ", "lịch trình", "cột mốc", "thời hạn", "hạn chót"],
    suggestions: [
      {
        word: "milestone",
        pos: "noun",
        meaningVi: "Cột mốc quan trọng đánh dấu giai đoạn hoàn thành của dự án",
        type: "primary",
        badge: "Quản lý dự án",
      },
      {
        word: "timeline",
        pos: "noun",
        meaningVi: "Dòng thời gian chi tiết các đầu việc cần hoàn thành",
        type: "synonym",
        badge: "Kế hoạch",
      },
      {
        word: "deadline",
        pos: "noun",
        meaningVi: "Hạn chót phải bàn giao kết quả công việc",
        type: "related",
        badge: "Thời hạn",
      },
    ],
  },
  {
    vietnamese: "năng suất",
    keywords: ["năng suất", "hiệu suất", "hiệu quả làm việc", "kết quả"],
    suggestions: [
      {
        word: "productivity",
        pos: "noun",
        meaningVi: "Năng suất làm việc của cá nhân hoặc đội ngũ trong một khoảng thời gian",
        type: "primary",
        badge: "Hiệu suất",
      },
      {
        word: "efficiency",
        pos: "noun",
        meaningVi: "Hiệu quả sử dụng thời gian và tài nguyên để đạt kết quả tối đa",
        type: "synonym",
        badge: "Tối ưu",
      },
      {
        word: "throughput",
        pos: "noun",
        meaningVi: "Khối lượng công việc hoặc dữ liệu được xử lý trong một đơn vị thời gian",
        type: "related",
        badge: "Hệ thống",
      },
    ],
  },
  {
    vietnamese: "đồng thuận",
    keywords: ["đồng thuận", "thống nhất", "nhất trí", "cùng quan điểm"],
    suggestions: [
      {
        word: "consensus",
        pos: "noun",
        meaningVi: "Sự đồng thuận chung của cả tập thể sau khi thảo luận",
        type: "primary",
        badge: "Họp hành",
      },
      {
        word: "alignment",
        pos: "noun",
        meaningVi: "Sự nhất quán, ăn khớp về mục tiêu và định hướng giữa các phòng ban",
        type: "synonym",
        badge: "Chiến lược",
      },
      {
        word: "concur",
        pos: "verb",
        meaningVi: "Bày tỏ sự đồng ý, tán thành với một quan điểm đưa ra",
        type: "related",
        badge: "Trang trọng",
      },
    ],
  },
  {
    vietnamese: "chuyển hướng",
    keywords: ["chuyển hướng", "thay đổi chiến lược", "thích nghi", "linh hoạt"],
    suggestions: [
      {
        word: "pivot",
        pos: "verb",
        meaningVi: "Chuyển hướng chiến lược kinh doanh hoặc sản phẩm khi cần thiết",
        type: "primary",
        badge: "Startup",
      },
      {
        word: "adapt",
        pos: "verb",
        meaningVi: "Thích ứng linh hoạt với hoàn cảnh hoặc công nghệ mới",
        type: "synonym",
        badge: "Kỹ năng",
      },
      {
        word: "agility",
        pos: "noun",
        meaningVi: "Sự nhanh nhạy, khả năng thích ứng linh hoạt trong vận hành",
        type: "related",
        badge: "Phương pháp",
      },
    ],
  },
  {
    vietnamese: "thuyết trình",
    keywords: ["thuyết trình", "trình bày", "báo cáo miệng", "pitching"],
    suggestions: [
      {
        word: "presentation",
        pos: "noun",
        meaningVi: "Bài thuyết trình, buổi trình bày kế hoạch trước tập thể",
        type: "primary",
        badge: "Công sở",
      },
      {
        word: "present",
        pos: "verb",
        meaningVi: "Thuyết trình, trình bày một ý tưởng hoặc giải pháp",
        type: "primary",
        badge: "Hành động",
      },
      {
        word: "pitch",
        pos: "verb",
        meaningVi: "Thuyết phục nhanh, chào hàng ý tưởng dự án hoặc gọi vốn",
        type: "synonym",
        badge: "Thuyết phục",
      },
      {
        word: "keynote",
        pos: "noun",
        meaningVi: "Bài phát biểu hoặc thuyết trình chủ đạo trong hội nghị",
        type: "related",
        badge: "Sự kiện",
      },
    ],
  },
  {
    vietnamese: "dự án",
    keywords: ["dự án", "kế hoạch dự án", "đầu việc"],
    suggestions: [
      {
        word: "project",
        pos: "noun",
        meaningVi: "Dự án, công trình, kế hoạch công việc có thời hạn cụ thể",
        type: "primary",
        badge: "Phổ biến",
      },
      {
        word: "initiative",
        pos: "noun",
        meaningVi: "Sáng kiến dự án mới được khởi xướng để tạo thay đổi",
        type: "synonym",
        badge: "Chiến lược",
      },
      {
        word: "venture",
        pos: "noun",
        meaningVi: "Dự án kinh doanh mới hoặc liên doanh có yếu tố mạo hiểm",
        type: "related",
        badge: "Đầu tư",
      },
    ],
  },
  {
    vietnamese: "triển khai",
    keywords: ["triển khai", "thực hiện", "áp dụng", "vận hành"],
    suggestions: [
      {
        word: "implement",
        pos: "verb",
        meaningVi: "Triển khai thực hiện kế hoạch hoặc chính sách vào thực tế",
        type: "primary",
        badge: "Vận hành",
      },
      {
        word: "execute",
        pos: "verb",
        meaningVi: "Thi hành, thực thi công việc một cách chuẩn xác và quyết liệt",
        type: "synonym",
        badge: "Hiệu quả",
      },
      {
        word: "deploy",
        pos: "verb",
        meaningVi: "Triển khai hệ thống, phần mềm hoặc phân bổ nhân lực",
        type: "synonym",
        badge: "Công nghệ",
      },
      {
        word: "roll out",
        pos: "verb",
        meaningVi: "Từng bước ra mắt và triển khai rộng rãi cho người dùng",
        type: "related",
        badge: "Sản phẩm",
      },
    ],
  },
  {
    vietnamese: "giải pháp",
    keywords: ["giải pháp", "cách giải quyết", "phương án"],
    suggestions: [
      {
        word: "solution",
        pos: "noun",
        meaningVi: "Giải pháp toàn diện xử lý vấn đề hoặc nhu cầu công việc",
        type: "primary",
        badge: "Kinh doanh",
      },
      {
        word: "approach",
        pos: "noun",
        meaningVi: "Cách tiếp cận, phương pháp giải quyết một bài toán",
        type: "synonym",
        badge: "Tư duy",
      },
      {
        word: "workaround",
        pos: "noun",
        meaningVi: "Giải pháp tạm thời để khắc phục sự cố trước mắt",
        type: "related",
        badge: "Xử lý sự cố",
      },
    ],
  },
  {
    vietnamese: "đánh giá",
    keywords: ["đánh giá", "nhận xét", "thẩm định", "kiểm tra"],
    suggestions: [
      {
        word: "evaluate",
        pos: "verb",
        meaningVi: "Đánh giá toàn diện giá trị, hiệu quả hoặc chất lượng",
        type: "primary",
        badge: "Phân tích",
      },
      {
        word: "assess",
        pos: "verb",
        meaningVi: "Thẩm định, xem xét mức độ tác động hoặc rủi ro",
        type: "synonym",
        badge: "Đo lường",
      },
      {
        word: "appraise",
        pos: "verb",
        meaningVi: "Định giá, đánh giá năng lực hoặc hiệu suất nhân sự (KPI)",
        type: "related",
        badge: "Nhân sự",
      },
    ],
  },
];

/**
 * Remove Vietnamese accents for loose matching (e.g. "hop tac" -> "hợp tác")
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Check if a text has explicit Vietnamese diacritics
 */
export function containsVietnameseDiacritics(text: string): boolean {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    text
  );
}

/**
 * Instant local lookup in curated business lexicon
 */
export function findInVietnameseLexicon(query: string): WordSuggestion[] | null {
  const clean = query.trim().toLowerCase();
  const unaccented = removeVietnameseAccents(clean);

  for (const entry of VIETNAMESE_LEXICON) {
    const directMatch = entry.keywords.some((k) => {
      const kClean = k.toLowerCase();
      const kUnacc = removeVietnameseAccents(kClean);
      return (
        clean === kClean ||
        unaccented === kUnacc ||
        clean.includes(kClean) ||
        unaccented.includes(kUnacc) ||
        (clean.length >= 4 && kClean.startsWith(clean)) ||
        (unaccented.length >= 4 && kUnacc.startsWith(unaccented))
      );
    });

    if (directMatch) {
      return entry.suggestions;
    }
  }

  return null;
}
