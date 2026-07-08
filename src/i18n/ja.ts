export default {
  site: {
    name: "札幌チェスクラブ",
    // JSON-LD の alternateName: 検索エンジンに他言語名を知らせる（表示言語の逆側の名前）
    alternateName: "Sapporo Chess Club",
    description:
      "札幌チェスクラブは、北海道のチェス愛好家が集まるコミュニティです。月2回の例会と年3回の公式大会を開催。見学無料、初心者歓迎。",
  },
  seo: {
    home: {
      // ページtitleの末尾に付く補足文（ブランド名だけでは検索対象が狭いため）
      titleSuffix: "北海道のチェスサークル・チェス大会・初心者歓迎",
      description:
        "札幌チェスクラブ公式サイト。月2回の例会と年3回の公式大会（北海道チェス選手権ほか）を開催。見学・初回参加は無料、初心者から経験者まで歓迎。札幌市中央区で活動する北海道のチェスサークル。",
    },
    schedule: {
      description:
        "札幌チェスクラブの年間スケジュール。月2回の例会と年3回の公式大会（北海道チェス選手権、札幌オープンほか）の日程を一覧で掲載。",
    },
    tournaments: {
      description:
        "札幌チェスクラブが主催・参加した大会記録アーカイブ。要項PDF・結果PDF・棋譜PGNを2000年から掲載。北海道チェス選手権ほか。",
    },
    announcementsList: {
      description:
        "札幌チェスクラブからの最新お知らせ一覧。例会報告、大会告知、会場変更などの情報を掲載。",
    },
    announcementsArchive: {
      description:
        "札幌チェスクラブの過去のお知らせアーカイブ。年別に過去の例会報告や大会告知を閲覧できます。",
    },
  },
  nav: {
    home: "ホーム",
    tournaments: "大会記録",
    skipToMain: "メインコンテンツへスキップ",
    openInNewTab: "（新しいタブで開く）",
    switchLanguage: "Switch to English",
    close: "Close",
    languageShort: "EN",
    languageFull: "English",
  },
  sections: {
    home: "HOME",
    schedule: "SCHEDULE",
    tournaments: "TOURNAMENTS",
    announcements: "NEWS",
  },
  hero: {
    subtitle: "北海道のチェス愛好家が集うコミュニティです。初心者歓迎。",
  },
  nextEvent: {
    meeting: "次回の例会",
    event: "次回のイベント",
  },
  about: {
    label: "クラブについて",
    body: "札幌チェスクラブは、1990年代から北海道・札幌で活動を続けるチェスサークルです。小学生から社会人・シニアまでどなたでも参加でき、初心者の方には教えてくれるメンバーもいます。チェスを始めてみたい方も、対局相手を探している方も、まずはお気軽に遊びに来てください。",
  },
  activities: {
    label: "活動内容",
    meetup: "例会",
    meetupDesc: "月2回の定期開催",
    tournament: "大会",
    tournamentDesc: "年3回の公式戦",
    lesson: "講座",
    lessonDesc: "メンバーが別会場で開講",
  },
  schedule: {
    label: "スケジュール",
    pageTitle: "スケジュール",
    pageSubtitle: "年間スケジュール",
    viewFullSchedule: "年間スケジュールを見る →",
    noUpcoming: "予定されているイベントはありません。",
    filterByYear: "年で絞り込み",
    allYears: "すべての年",
    all: "すべて",
    dayOfWeekSuffix: "曜日",
    roomSuffix: "室",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  clubInfo: {
    fee: "参加案内",
    venue: "会場",
    general: "一般",
    students: "学生",
    observation: "見学・初回参加",
    free: "無料",
    viewOnMap: "Google マップで見る",
  },
  lessons: {
    label: "チェス講座",
    viewDetails: "詳細を見る",
  },
  rss: {
    title: "札幌チェスクラブ お知らせ",
    description: "札幌チェスクラブの新着情報",
  },
  announcements: {
    label: "お知らせ",
    pageTitle: "お知らせ",
    pageSubtitle: "新着情報・お知らせ一覧",
    viewAll: "お知らせ一覧を見る →",
    back: "← お知らせ一覧",
    prev: "前のお知らせ",
    next: "次のお知らせ",
    empty: "まだお知らせはありません。",
    englishNotAvailable: "",
    englishNotAvailableDetail: "",
    englishNotAvailableShort: "",
    archivePageTitle: "お知らせアーカイブ",
    viewArchive: "過去のお知らせを見る →",
    archiveEmpty: "アーカイブはまだありません。",
    subscribeRss: "RSS で購読",
  },
  resources: {
    label: "リンク / 資料",
    pamphlet: "クラブ案内 (PDF)",
    jca: "日本チェス連盟",
  },
  contact: {
    label: "お問い合わせ",
  },
  tournament: {
    pageTitle: "大会記録",
    pageSubtitle: "2000年〜現在までの全大会アーカイブ",
    detailsPdf: "要項 PDF",
    resultsPdf: "結果 PDF",
    gamesPgn: "棋譜 PGN",
    gamesPgnAnnotated: "棋譜 PGN (解析付)",
    downloadAria: (label: string) => `${label}をダウンロード`,
    // 年フィルタ変更時に aria-live へ書き込むテンプレート。{label} {count} はクライアント側で置換
    filterAnnounce: "{label}: {count}件表示中",
  },
  badge: {
    tournamentTag: "大会",
    meetingTag: "例会",
  },
  menu: {
    sectionLabel: "セクション",
    activities: "活動内容",
    info: "参加案内・会場",
    lessons: "チェス講座",
    links: "リンク",
    contact: "お問い合わせ",
  },
} as const;
