import { DictionaryEntry } from "@/types/dictionary";

export const PRESET_DICTIONARY_ENTRIES: Record<string, DictionaryEntry> = {
  benchmark: {
    word: "benchmark",
    phonetic: "/ˈbɛntʃ.mɑːrk/",
    translationVi: "Điểm chuẩn, tiêu chuẩn đánh giá và so sánh hiệu suất",
    synonyms: ["standard", "yardstick", "criterion", "gauge", "reference point"],
    antonyms: ["guesswork", "aberration", "deviation"],
    phonetics: [
      {
        text: "/ˈbɛntʃ.mɑːrk/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/benchmark-uk.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "A standard, point of reference, or criterion by which other things may be measured, compared, or judged.",
            definitionVi:
              "Một tiêu chuẩn, mốc tham chiếu hoặc tiêu chí dùng để đo lường, so sánh hoặc đánh giá.",
            example: "The company's customer satisfaction score set a new benchmark for the sector.",
            exampleVi: "Điểm mức độ hài lòng khách hàng của công ty đã thiết lập một chuẩn mực mới cho ngành.",
            synonyms: ["standard", "reference point", "yardstick", "criterion"],
            antonyms: ["anomaly"],
          },
          {
            definition:
              "A test used to compare the relative performance of computers or software programs.",
            definitionVi:
              "Một bài kiểm tra dùng để so sánh hiệu năng tương đối của máy tính hoặc phần mềm.",
            example: "The new processor outperformed its rival in every speed benchmark.",
            exampleVi: "Bộ vi xử lý mới đã vượt qua đối thủ trong mọi bài đo hiệu năng tốc độ.",
          },
        ],
        synonyms: ["standard", "criterion", "gauge"],
      },
      {
        partOfSpeech: "verb",
        partOfSpeechVi: "Động từ",
        definitions: [
          {
            definition:
              "To evaluate or check something by comparison with an established standard.",
            definitionVi:
              "Đánh giá hoặc đối chuẩn một quy trình dựa trên việc so sánh với tiêu chuẩn đã có.",
            example: "We need to benchmark our development cycle against industry leaders.",
            exampleVi: "Chúng ta cần đối chuẩn chu kỳ phát triển của mình với các doanh nghiệp dẫn đầu ngành.",
            synonyms: ["compare", "evaluate", "measure"],
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/benchmark"],
  },
  delegate: {
    word: "delegate",
    phonetic: "/ˈdɛl.ɪ.ɡeɪt/",
    translationVi: "Ủy quyền, giao phó trách nhiệm / Người đại biểu",
    synonyms: ["assign", "entrust", "pass on", "transfer", "representative"],
    antonyms: ["centralize", "retain", "withhold"],
    phonetics: [
      {
        text: "/ˈdɛl.ɪ.ɡeɪt/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/delegate-uk.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "verb",
        partOfSpeechVi: "Động từ",
        definitions: [
          {
            definition:
              "To entrust a task, responsibility, or power to another person, typically one who is less senior.",
            definitionVi:
              "Giao phó nhiệm vụ, trách nhiệm hoặc quyền hạn cho người khác (thường là cấp dưới).",
            example: "A successful engineering manager knows how to delegate operational duties.",
            exampleVi: "Một quản lý kỹ thuật giỏi luôn biết cách giao phó các nhiệm vụ vận hành.",
            synonyms: ["assign", "entrust", "pass on", "transfer"],
            antonyms: ["hoard", "centralize"],
          },
        ],
        synonyms: ["entrust", "assign"],
      },
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "A person sent or authorized to represent others, in particular at a conference or council.",
            definitionVi:
              "Người được cử hoặc ủy quyền đại diện cho tập thể, đặc biệt là tại hội nghị.",
            example: "Over three hundred international delegates attended the technology summit.",
            exampleVi: "Hơn ba trăm đại biểu quốc tế đã tham dự hội nghị thượng đỉnh công nghệ.",
            synonyms: ["representative", "envoy", "deputy"],
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/delegate"],
  },
  bottleneck: {
    word: "bottleneck",
    phonetic: "/ˈbɒt.əl.nɛk/",
    translationVi: "Điểm nghẽn, nút thắt cản trở tiến độ quy trình",
    synonyms: ["obstacle", "impasse", "barrier", "obstruction", "jam"],
    antonyms: ["catalyst", "accelerator", "breakthrough"],
    phonetics: [
      {
        text: "/ˈbɒt.əl.nɛk/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/bottleneck-uk.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "A point of congestion or blockage in a system or process that delays progress or production.",
            definitionVi:
              "Điểm tắc nghẽn hoặc cản trở trong hệ thống khiến tiến độ công việc bị chậm trễ.",
            example: "Code review delays became the main bottleneck in our CI/CD deployment pipeline.",
            exampleVi: "Sự chậm trễ trong khâu duyệt mã đã trở thành điểm nghẽn chính trong quy trình CI/CD.",
            synonyms: ["obstacle", "impasse", "barrier", "obstruction"],
            antonyms: ["accelerator"],
          },
        ],
      },
      {
        partOfSpeech: "verb",
        partOfSpeechVi: "Động từ",
        definitions: [
          {
            definition: "To hinder, impede, or slow down the progress of an operation.",
            definitionVi: "Cản trở hoặc làm chậm trễ tiến trình của một hoạt động.",
            example: "A lack of database indexing can bottleneck query execution times.",
            exampleVi: "Việc thiếu chỉ mục cơ sở dữ liệu có thể gây nghẽn tốc độ thực thi truy vấn.",
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/bottleneck"],
  },
  stakeholder: {
    word: "stakeholder",
    phonetic: "/ˈsteɪkˌhoʊl.dər/",
    translationVi: "Các bên liên quan có lợi ích trong dự án hoặc doanh nghiệp",
    synonyms: ["partner", "investor", "interested party", "shareholder"],
    antonyms: ["outsider", "bystander"],
    phonetics: [
      {
        text: "/ˈsteɪkˌhoʊl.dər/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/stakeholder-us.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "A person, group, or organization that has an interest or concern in a business or enterprise.",
            definitionVi:
              "Người, nhóm hoặc tổ chức có quyền lợi hoặc sự quan tâm trong một doanh nghiệp/dự án.",
            example: "We presented the quarterly product roadmap to internal and external stakeholders.",
            exampleVi: "Chúng tôi đã trình bày lộ trình sản phẩm quý cho các bên liên quan nội bộ và bên ngoài.",
            synonyms: ["partner", "investor", "interested party"],
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/stakeholder"],
  },
  synergy: {
    word: "synergy",
    phonetic: "/ˈsɪn.ər.dʒi/",
    translationVi: "Hiệu ứng cộng hưởng, sức mạnh tổng hợp",
    synonyms: ["collaboration", "cooperation", "combined effort", "harmony"],
    antonyms: ["conflict", "discord", "antagonism"],
    phonetics: [
      {
        text: "/ˈsɪn.ər.dʒi/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/synergy-us.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "The interaction or cooperation of two or more organizations, substances, or other agents to produce a combined effect greater than the sum of their separate effects.",
            definitionVi:
              "Sự tương tác hoặc hợp tác giữa các bên tạo ra hiệu quả tổng hợp lớn hơn tổng các phần riêng lẻ.",
            example: "The merger created synergy between engineering talent and marketing reach.",
            exampleVi: "Thương vụ sáp nhập đã tạo ra sức mạnh cộng hưởng giữa nhân tài kỹ thuật và mạng lưới tiếp thị.",
            synonyms: ["collaboration", "cooperation", "combined effort", "harmony"],
            antonyms: ["antagonism"],
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/synergy"],
  },
  feasibility: {
    word: "feasibility",
    phonetic: "/ˌfiː.zəˈbɪl.ə.ti/",
    translationVi: "Tính khả thi, mức độ thực tế có thể thực hiện",
    synonyms: ["viability", "practicality", "workability"],
    antonyms: ["impossibility", "impracticability", "unfeasibility"],
    phonetics: [
      {
        text: "/ˌfiː.zəˈbɪl.ə.ti/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/feasibility-us.mp3",
      },
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        partOfSpeechVi: "Danh từ",
        definitions: [
          {
            definition:
              "The state or degree of being easily or conveniently done; practicality.",
            definitionVi:
              "Mức độ dễ dàng hoặc thuận tiện để thực hiện; tính thực tiễn cao.",
            example: "We conducted a feasibility study before greenlighting the cloud migration.",
            exampleVi: "Chúng tôi đã tiến hành nghiên cứu tính khả thi trước khi phê duyệt dự án chuyển đổi đám mây.",
            synonyms: ["viability", "practicality", "workability"],
            antonyms: ["impracticability"],
          },
        ],
      },
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/feasibility"],
  },
};
