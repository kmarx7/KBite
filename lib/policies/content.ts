export type PolicySlug = "terms" | "privacy" | "partner" | "refund";

export type SupportedPolicyLocale =
  | "ko"
  | "en"
  | "zh"
  | "ja"
  | "vi"
  | "th"
  | "ru"
  | "ar"
  | "fa";

export const POLICY_LOCALES: SupportedPolicyLocale[] = [
  "ko", "en", "zh", "ja", "vi", "th", "ru", "ar", "fa",
];

export interface PolicyDoc {
  title: string;
  effectiveDate: string;
  sections: { heading: string; body: string }[];
}

type PolicyContent = Record<PolicySlug, Record<SupportedPolicyLocale, PolicyDoc>>;

const CONTACT_EMAIL = "marx21c@gmail.com";

export const POLICIES: PolicyContent = {
  terms: {
    ko: {
      title: "이용약관",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "제1조 (목적)", body: "이 약관은 KBite(이하 \"서비스\")가 제공하는 위치 기반 식당 탐색 서비스의 이용 조건과 운영자·이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다." },
        { heading: "제2조 (정의)", body: "\"이용자\"란 본 약관에 따라 서비스를 이용하는 자를 말합니다. \"파트너\"란 서비스에 식당 정보를 등록한 사업자를 말합니다. \"콘텐츠\"란 서비스 내 게시된 식당 정보, 리뷰, 사진 등을 말합니다." },
        { heading: "제3조 (약관의 효력 및 변경)", body: "본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 7일 전(이용자에게 불리한 변경은 30일 전)부터 공지합니다." },
        { heading: "제4조 (서비스의 내용)", body: "서비스는 이용자의 위치 또는 선택한 지역을 기준으로 식당 정보를 검색·열람할 수 있는 기능을 제공합니다. 위치 정보는 이용자 기기에서 거리 계산에만 사용되며 서버에 저장되지 않습니다. 예약·길찾기 등 외부 링크는 해당 외부 서비스의 약관을 따릅니다." },
        { heading: "제5조 (이용자의 의무)", body: "이용자는 타인의 정보 도용, 허위 정보 등록, 서비스 운영 방해, 관련 법령 위반 행위를 해서는 안 됩니다. 리뷰 등 콘텐츠 작성 시 사실에 기반해야 하며 타인의 권리를 침해하지 않아야 합니다." },
        { heading: "제6조 (콘텐츠의 권리와 책임)", body: "이용자가 작성한 콘텐츠의 저작권은 작성자에게 있으며, 이용자는 서비스 운영·홍보 목적의 사용 권한을 운영자에게 무상으로 부여합니다. 법령 또는 약관을 위반한 콘텐츠는 사전 통지 없이 삭제될 수 있습니다." },
        { heading: "제7조 (면책)", body: "운영자는 파트너가 등록한 정보(영업시간, 가격, 인증 여부 등)의 정확성을 보증하지 않으며, 이용자와 식당 간에 발생한 거래·분쟁에 대해 관련 법령에서 정한 경우를 제외하고 책임을 지지 않습니다. 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해서도 같습니다." },
        { heading: "제8조 (서비스의 변경 및 중단)", body: "운영자는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 중대한 변경은 사전에 공지합니다." },
        { heading: "제9조 (준거법 및 관할)", body: "본 약관은 대한민국 법령에 따라 해석되며, 분쟁은 민사소송법상 관할 법원에 제기합니다. 문의: " + CONTACT_EMAIL },
      ],
    },
    en: {
      title: "Terms of Service",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Purpose", body: "These Terms govern your use of KBite (the \"Service\"), a location-based restaurant discovery service, and set out the rights and obligations of the operator and users." },
        { heading: "2. Definitions", body: "\"User\" means anyone who uses the Service under these Terms. \"Partner\" means a business that has listed a restaurant on the Service. \"Content\" means restaurant information, reviews, photos and other materials posted on the Service." },
        { heading: "3. Effect and Amendment of Terms", body: "These Terms take effect upon posting in the Service. The operator may amend them within the bounds of applicable law, giving at least 7 days' notice (30 days for changes unfavorable to users)." },
        { heading: "4. The Service", body: "The Service lets you search and browse restaurant information based on your location or a selected area. Your device location is used only on your device to calculate distances and is not stored on our servers. External links such as reservations and directions are governed by the respective external services' terms." },
        { heading: "5. User Obligations", body: "Users must not impersonate others, register false information, interfere with the operation of the Service, or violate applicable laws. Reviews and other content must be based on facts and must not infringe the rights of others." },
        { heading: "6. Content Rights and Responsibility", body: "Users retain copyright in content they create and grant the operator a free license to use it for operating and promoting the Service. Content that violates the law or these Terms may be removed without prior notice." },
        { heading: "7. Disclaimer", body: "The operator does not guarantee the accuracy of information registered by Partners (opening hours, prices, certifications, etc.) and is not liable for transactions or disputes between users and restaurants except as required by law, nor for interruptions caused by force majeure or system failures." },
        { heading: "8. Changes to the Service", body: "The operator may change or discontinue all or part of the Service. Material changes will be announced in advance." },
        { heading: "9. Governing Law", body: "These Terms are governed by the laws of the Republic of Korea. Contact: " + CONTACT_EMAIL },
      ],
    },
    zh: {
      title: "服务条款",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 目的", body: "本条款规定了KBite（以下简称\"服务\"）提供的基于位置的餐厅搜索服务的使用条件，以及运营者与用户的权利、义务和责任。" },
        { heading: "2. 定义", body: "\"用户\"是指依据本条款使用服务的人。\"合作伙伴\"是指在服务中注册餐厅信息的商家。\"内容\"是指服务中发布的餐厅信息、评价、照片等。" },
        { heading: "3. 条款效力与变更", body: "本条款自发布于服务页面起生效。运营者可在法律允许范围内修改条款，修改时提前7天公告（对用户不利的变更提前30天公告）。" },
        { heading: "4. 服务内容", body: "服务提供基于用户位置或所选地区搜索和浏览餐厅信息的功能。位置信息仅在用户设备上用于计算距离，不存储于服务器。预订、导航等外部链接受相应外部服务条款约束。" },
        { heading: "5. 用户义务", body: "用户不得冒用他人信息、注册虚假信息、妨碍服务运营或违反相关法律法规。用户发布的评价等内容须基于事实，不得侵犯他人权利。" },
        { heading: "6. 内容权利与责任", body: "用户创作内容的著作权归用户所有，用户授予运营者免费使用该内容用于服务运营和推广的权限。违反法律或本条款的内容可在不事先通知的情况下删除。" },
        { heading: "7. 免责声明", body: "运营者不保证合作伙伴注册信息（营业时间、价格、认证等）的准确性，除法律规定外不对用户与餐厅之间的交易或纠纷承担责任，对不可抗力或系统故障导致的服务中断亦同。" },
        { heading: "8. 服务变更与终止", body: "运营者可变更或终止全部或部分服务，重大变更将提前公告。" },
        { heading: "9. 适用法律", body: "本条款依据韩国法律解释。联系方式：" + CONTACT_EMAIL },
      ],
    },
    ja: {
      title: "利用規約",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 目的", body: "この利用規約は、KBite（以下「サービス」）の位置情報を活用したレストラン検索サービスの利用条件、並びに運営者と利用者の権利・義務・責任について定めることを目的とします。" },
        { heading: "2. 定義", body: "「利用者」とは本規約に基づきサービスを利用する者をいいます。「パートナー」とはサービスにレストラン情報を登録した事業者をいいます。「コンテンツ」とはサービス上に投稿されたレストラン情報・レビュー・写真等をいいます。" },
        { heading: "3. 規約の効力および変更", body: "本規約はサービス画面への掲載をもって効力を生じます。運営者は関連法令に反しない範囲で変更でき、変更の際は施行日7日前（利用者に不利な変更は30日前）から告知します。" },
        { heading: "4. サービスの内容", body: "サービスは利用者の位置情報または選択したエリアに基づき、レストラン情報を検索・閲覧できる機能を提供します。位置情報は端末上で距離計算のみに使用され、サーバーに保存されません。予約・ナビ等の外部リンクは各外部サービスの利用規約に従います。" },
        { heading: "5. 利用者の義務", body: "利用者は、他者の情報を盗用したり、虚偽情報を登録したり、サービス運営を妨害したり、関連法令に違反する行為をしてはなりません。レビュー等のコンテンツは事実に基づき、他者の権利を侵害しないようにしてください。" },
        { heading: "6. コンテンツの権利と責任", body: "利用者が作成したコンテンツの著作権は作成者に帰属し、利用者はサービスの運営・宣伝目的での使用権限を運営者に無償で付与します。法令または本規約に違反したコンテンツは事前通知なく削除されることがあります。" },
        { heading: "7. 免責事項", body: "運営者はパートナーが登録した情報（営業時間・価格・認証等）の正確性を保証せず、法令で定める場合を除き、利用者と飲食店との取引・紛争について責任を負いません。不可抗力やシステム障害によるサービス停止についても同様です。" },
        { heading: "8. サービスの変更・中断", body: "運営者はサービスの全部または一部を変更・中断することができ、重大な変更は事前に告知します。" },
        { heading: "9. 準拠法および管轄", body: "本規約は大韓民国の法律に従い解釈されます。お問い合わせ：" + CONTACT_EMAIL },
      ],
    },
    vi: {
      title: "Điều khoản Dịch vụ",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Mục đích", body: "Điều khoản này quy định các điều kiện sử dụng dịch vụ tìm kiếm nhà hàng dựa trên vị trí của KBite (\"Dịch vụ\"), cùng với quyền, nghĩa vụ và trách nhiệm của nhà điều hành và người dùng." },
        { heading: "2. Định nghĩa", body: "\"Người dùng\" là người sử dụng Dịch vụ theo Điều khoản này. \"Đối tác\" là doanh nghiệp đăng ký thông tin nhà hàng trên Dịch vụ. \"Nội dung\" là thông tin nhà hàng, đánh giá, ảnh và các tài liệu khác được đăng tải trên Dịch vụ." },
        { heading: "3. Hiệu lực và sửa đổi", body: "Điều khoản có hiệu lực khi được đăng trên Dịch vụ. Nhà điều hành có thể sửa đổi trong phạm vi pháp luật cho phép, với thông báo ít nhất 7 ngày trước (30 ngày đối với thay đổi bất lợi cho người dùng)." },
        { heading: "4. Nội dung Dịch vụ", body: "Dịch vụ cung cấp chức năng tìm kiếm và duyệt thông tin nhà hàng dựa trên vị trí của bạn hoặc khu vực đã chọn. Thông tin vị trí chỉ được sử dụng trên thiết bị của bạn để tính khoảng cách và không được lưu trữ trên máy chủ. Các liên kết bên ngoài như đặt bàn và chỉ đường tuân theo điều khoản của dịch vụ bên ngoài tương ứng." },
        { heading: "5. Nghĩa vụ của người dùng", body: "Người dùng không được giả mạo thông tin của người khác, đăng thông tin sai, cản trở hoạt động của Dịch vụ hoặc vi phạm pháp luật. Đánh giá và nội dung phải dựa trên sự thật và không được xâm phạm quyền của người khác." },
        { heading: "6. Quyền và trách nhiệm về nội dung", body: "Người dùng giữ bản quyền đối với nội dung họ tạo ra và cấp cho nhà điều hành giấy phép miễn phí để sử dụng nội dung đó cho mục đích vận hành và quảng bá Dịch vụ. Nội dung vi phạm pháp luật hoặc Điều khoản này có thể bị xóa mà không cần thông báo trước." },
        { heading: "7. Miễn trách nhiệm", body: "Nhà điều hành không bảo đảm tính chính xác của thông tin do Đối tác đăng ký (giờ mở cửa, giá, chứng nhận, v.v.) và không chịu trách nhiệm về các giao dịch hoặc tranh chấp giữa người dùng và nhà hàng, trừ khi pháp luật yêu cầu, cũng như về gián đoạn do bất khả kháng hoặc lỗi hệ thống." },
        { heading: "8. Thay đổi Dịch vụ", body: "Nhà điều hành có thể thay đổi hoặc ngừng toàn bộ hay một phần Dịch vụ. Các thay đổi quan trọng sẽ được thông báo trước." },
        { heading: "9. Luật áp dụng", body: "Điều khoản này được điều chỉnh bởi luật pháp Hàn Quốc. Liên hệ: " + CONTACT_EMAIL },
      ],
    },
    th: {
      title: "ข้อกำหนดการให้บริการ",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. วัตถุประสงค์", body: "ข้อกำหนดนี้กำหนดเงื่อนไขการใช้บริการค้นหาร้านอาหารตามตำแหน่งของ KBite (\"บริการ\") รวมถึงสิทธิ์ หน้าที่ และความรับผิดชอบของผู้ให้บริการและผู้ใช้" },
        { heading: "2. คำนิยาม", body: "\"ผู้ใช้\" หมายถึงบุคคลที่ใช้บริการตามข้อกำหนดนี้ \"พาร์ทเนอร์\" หมายถึงธุรกิจที่ลงทะเบียนข้อมูลร้านอาหารในบริการ \"เนื้อหา\" หมายถึงข้อมูลร้านอาหาร รีวิว รูปภาพ และสื่ออื่นๆ ที่โพสต์ในบริการ" },
        { heading: "3. ผลบังคับใช้และการแก้ไข", body: "ข้อกำหนดมีผลใช้บังคับเมื่อเผยแพร่ในบริการ ผู้ให้บริการอาจแก้ไขได้ภายในขอบเขตของกฎหมายที่บังคับใช้ โดยแจ้งล่วงหน้าอย่างน้อย 7 วัน (30 วันสำหรับการเปลี่ยนแปลงที่ไม่เป็นประโยชน์ต่อผู้ใช้)" },
        { heading: "4. บริการ", body: "บริการช่วยให้คุณค้นหาและเรียกดูข้อมูลร้านอาหารตามตำแหน่งของคุณหรือพื้นที่ที่เลือก ข้อมูลตำแหน่งอุปกรณ์ใช้เฉพาะบนอุปกรณ์ของคุณเพื่อคำนวณระยะทาง และจะไม่ถูกเก็บไว้บนเซิร์ฟเวอร์ของเรา ลิงก์ภายนอก เช่น การจองและการนำทาง อยู่ภายใต้ข้อกำหนดของบริการภายนอกนั้นๆ" },
        { heading: "5. หน้าที่ของผู้ใช้", body: "ผู้ใช้ต้องไม่แอบอ้างเป็นผู้อื่น ลงทะเบียนข้อมูลเท็จ ขัดขวางการดำเนินงานของบริการ หรือละเมิดกฎหมายที่บังคับใช้ รีวิวและเนื้อหาต้องอิงตามความเป็นจริงและต้องไม่ละเมิดสิทธิ์ของผู้อื่น" },
        { heading: "6. สิทธิ์และความรับผิดชอบด้านเนื้อหา", body: "ผู้ใช้ยังคงลิขสิทธิ์ในเนื้อหาที่ตนสร้าง และมอบสิทธิ์การใช้งานฟรีให้ผู้ให้บริการเพื่อใช้ในการดำเนินงานและส่งเสริมบริการ เนื้อหาที่ละเมิดกฎหมายหรือข้อกำหนดเหล่านี้อาจถูกลบโดยไม่ต้องแจ้งให้ทราบล่วงหน้า" },
        { heading: "7. ข้อจำกัดความรับผิด", body: "ผู้ให้บริการไม่รับประกันความถูกต้องของข้อมูลที่พาร์ทเนอร์ลงทะเบียน (เวลาทำการ ราคา ใบรับรอง ฯลฯ) และไม่รับผิดชอบต่อธุรกรรมหรือข้อพิพาทระหว่างผู้ใช้กับร้านอาหาร ยกเว้นตามที่กฎหมายกำหนด รวมถึงการหยุดให้บริการเนื่องจากเหตุสุดวิสัยหรือความล้มเหลวของระบบด้วย" },
        { heading: "8. การเปลี่ยนแปลงบริการ", body: "ผู้ให้บริการอาจเปลี่ยนแปลงหรือยุติบริการทั้งหมดหรือบางส่วน การเปลี่ยนแปลงที่สำคัญจะได้รับการประกาศล่วงหน้า" },
        { heading: "9. กฎหมายที่บังคับใช้", body: "ข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายของสาธารณรัฐเกาหลี ติดต่อ: " + CONTACT_EMAIL },
      ],
    },
    ru: {
      title: "Условия использования",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Цели", body: "Настоящие Условия регулируют использование KBite («Сервис»), сервиса поиска ресторанов на основе геолокации, и устанавливают права и обязанности оператора и пользователей." },
        { heading: "2. Определения", body: "«Пользователь» — лицо, использующее Сервис в соответствии с настоящими Условиями. «Партнёр» — компания, разместившая информацию о ресторане в Сервисе. «Контент» — информация о ресторанах, отзывы, фотографии и иные материалы, размещённые в Сервисе." },
        { heading: "3. Действие и изменение Условий", body: "Условия вступают в силу с момента их публикации в Сервисе. Оператор может вносить изменения в рамках применимого законодательства, уведомляя не менее чем за 7 дней (за 30 дней — об изменениях, ухудшающих положение пользователей)." },
        { heading: "4. Описание Сервиса", body: "Сервис позволяет искать и просматривать информацию о ресторанах по вашему местоположению или выбранному району. Геолокация устройства используется только на вашем устройстве для расчёта расстояний и не передаётся на наши серверы. Внешние ссылки (бронирование, навигация) регулируются условиями соответствующих внешних сервисов." },
        { heading: "5. Обязанности пользователей", body: "Пользователи не вправе выдавать себя за других лиц, размещать ложную информацию, нарушать работу Сервиса или нарушать применимые законы. Отзывы и иной контент должны быть правдивыми и не нарушать права третьих лиц." },
        { heading: "6. Права и ответственность за контент", body: "Авторские права на созданный пользователями контент принадлежат им; пользователи предоставляют оператору бесплатную лицензию на использование контента в целях эксплуатации и продвижения Сервиса. Контент, нарушающий законодательство или настоящие Условия, может быть удалён без предварительного уведомления." },
        { heading: "7. Ограничение ответственности", body: "Оператор не гарантирует точность информации, размещённой Партнёрами (часы работы, цены, сертификации и т. д.), и не несёт ответственности за сделки или споры между пользователями и ресторанами, за исключением случаев, предусмотренных законом, а также за перебои вследствие форс-мажора или системных сбоев." },
        { heading: "8. Изменение Сервиса", body: "Оператор вправе изменить или прекратить работу Сервиса полностью или частично; о существенных изменениях будет сообщено заблаговременно." },
        { heading: "9. Применимое право", body: "Настоящие Условия регулируются законодательством Республики Корея. Контакт: " + CONTACT_EMAIL },
      ],
    },
    ar: {
      title: "شروط الخدمة",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. الغرض", body: "تحكم هذه الشروط استخدامك لـ KBite (\"الخدمة\")، وهي خدمة اكتشاف المطاعم القائمة على الموقع الجغرافي، وتحدد حقوق والتزامات مزود الخدمة والمستخدمين." },
        { heading: "2. التعريفات", body: "\"المستخدم\" هو أي شخص يستخدم الخدمة وفقًا لهذه الشروط. \"الشريك\" هو أي شركة أدرجت مطعمًا في الخدمة. \"المحتوى\" يعني معلومات المطاعم والتقييمات والصور وغيرها من المواد المنشورة في الخدمة." },
        { heading: "3. نفاذ الشروط وتعديلها", body: "تسري هذه الشروط فور نشرها في الخدمة. يجوز للمشغل تعديلها في حدود القانون المعمول به، مع إشعار لا يقل عن 7 أيام (30 يومًا للتغييرات غير المواتية للمستخدمين)." },
        { heading: "4. الخدمة", body: "تتيح الخدمة البحث عن معلومات المطاعم وتصفحها بناءً على موقعك أو منطقة محددة. تُستخدم بيانات موقع جهازك فقط على جهازك لحساب المسافات، ولا تُخزَّن على خوادمنا. تخضع الروابط الخارجية، كالحجز والتنقل، لشروط الخدمات الخارجية المعنية." },
        { heading: "5. التزامات المستخدم", body: "لا يجوز للمستخدمين انتحال هويات الآخرين، أو تسجيل معلومات مزيفة، أو التدخل في تشغيل الخدمة، أو انتهاك القوانين المعمول بها. يجب أن تكون التقييمات والمحتوى الأخرى مستندةً إلى وقائع حقيقية، ولا تنتهك حقوق الآخرين." },
        { heading: "6. حقوق المحتوى ومسؤوليته", body: "يحتفظ المستخدمون بحقوق الملكية الفكرية للمحتوى الذي ينشئونه، ويمنحون المشغل ترخيصًا مجانيًا لاستخدامه في تشغيل الخدمة والترويج لها. يجوز حذف المحتوى المخالف للقانون أو هذه الشروط دون إشعار مسبق." },
        { heading: "7. إخلاء المسؤولية", body: "لا يضمن المشغل دقة المعلومات التي يسجلها الشركاء (ساعات العمل والأسعار والشهادات وغيرها)، ولا يتحمل المسؤولية عن المعاملات أو النزاعات بين المستخدمين والمطاعم إلا في الحالات التي يستوجبها القانون، ولا عن الانقطاعات الناجمة عن قوة قاهرة أو أعطال في النظام." },
        { heading: "8. تغييرات الخدمة", body: "يجوز للمشغل تغيير الخدمة أو إيقافها كليًا أو جزئيًا، وستُعلَن التغييرات الجوهرية مسبقًا." },
        { heading: "9. القانون المطبق", body: "تخضع هذه الشروط لقوانين جمهورية كوريا. للتواصل: " + CONTACT_EMAIL },
      ],
    },
    fa: {
      title: "شرایط خدمات",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. هدف", body: "این شرایط استفاده از KBite (\"سرویس\")، یک سرویس کشف رستوران مبتنی بر موقعیت مکانی، را تنظیم می‌کند و حقوق و تعهدات اپراتور و کاربران را مشخص می‌سازد." },
        { heading: "2. تعاریف", body: "\"کاربر\" به هر کسی گفته می‌شود که از سرویس طبق این شرایط استفاده می‌کند. \"شریک\" به کسب‌وکاری گفته می‌شود که رستورانی را در سرویس ثبت کرده است. \"محتوا\" به اطلاعات رستوران، نظرات، عکس‌ها و سایر موادی گفته می‌شود که در سرویس منتشر شده‌اند." },
        { heading: "3. اثر و اصلاح شرایط", body: "این شرایط پس از انتشار در سرویس لازم‌الاجرا می‌شود. اپراتور می‌تواند آن‌ها را در چارچوب قوانین جاری تغییر دهد و حداقل ۷ روز قبل اطلاع‌رسانی می‌کند (۳۰ روز برای تغییراتی که به ضرر کاربران است)." },
        { heading: "4. سرویس", body: "سرویس امکان جستجو و مرور اطلاعات رستوران بر اساس موقعیت مکانی یا منطقه انتخابی شما را فراهم می‌کند. اطلاعات موقعیت دستگاه تنها روی دستگاه شما برای محاسبه فاصله استفاده می‌شود و در سرورهای ما ذخیره نمی‌شود. لینک‌های خارجی مانند رزرو و مسیریابی تابع شرایط سرویس‌های خارجی مربوطه هستند." },
        { heading: "5. تعهدات کاربر", body: "کاربران نباید هویت دیگران را جعل کنند، اطلاعات نادرست ثبت کنند، در عملکرد سرویس اختلال ایجاد کنند یا قوانین جاری را نقض کنند. نظرات و سایر محتوا باید مبتنی بر واقعیت باشند و حقوق دیگران را نقض نکنند." },
        { heading: "6. حقوق و مسئولیت محتوا", body: "کاربران حق مالکیت معنوی محتوایی که ایجاد می‌کنند را حفظ می‌کنند و به اپراتور مجوز رایگان برای استفاده از آن در جهت بهره‌برداری و تبلیغ سرویس می‌دهند. محتوایی که قوانین یا این شرایط را نقض می‌کند ممکن است بدون اطلاع قبلی حذف شود." },
        { heading: "7. سلب مسئولیت", body: "اپراتور دقت اطلاعات ثبت‌شده توسط شرکا (ساعات کاری، قیمت‌ها، گواهینامه‌ها و غیره) را تضمین نمی‌کند و جز در مواردی که قانون الزام می‌کند، مسئول معاملات یا اختلافات بین کاربران و رستوران‌ها نیست، همچنین مسئول قطعی ناشی از فورس ماژور یا خرابی سیستم نیز نمی‌باشد." },
        { heading: "8. تغییرات سرویس", body: "اپراتور می‌تواند تمام یا بخشی از سرویس را تغییر دهد یا متوقف کند؛ تغییرات مهم از قبل اطلاع‌رسانی خواهند شد." },
        { heading: "9. قانون حاکم", body: "این شرایط تابع قوانین جمهوری کره است. تماس: " + CONTACT_EMAIL },
      ],
    },
  },

  privacy: {
    ko: {
      title: "개인정보처리방침",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 수집하는 개인정보", body: "파트너(식당 등록): 식당명, 대표 이메일, 전화번호, 주소, 사업자등록번호. 이용자(계정 생성 시): 이메일, 국적(선택), 선호 언어. 자동 수집: 언어 설정 쿠키, 서비스 이용 기록(익명화된 분석 이벤트). 기기 위치 정보는 기기 내 거리 계산에만 사용되며 서버로 전송·저장되지 않습니다." },
        { heading: "2. 수집·이용 목적", body: "식당 등록 검수 및 운영, 서비스 제공·개선, 다국어 설정 유지, 부정 이용 방지, 법령상 의무 이행." },
        { heading: "3. 보유 및 이용 기간", body: "회원 탈퇴 또는 등록 삭제 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령에 따라 보존 의무가 있는 정보는 해당 기간 동안 보관합니다." },
        { heading: "4. 제3자 제공", body: "이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 법령에 근거한 요청이 있는 경우는 예외로 합니다." },
        { heading: "5. 처리 위탁 및 국외 이전", body: "서비스 운영을 위해 다음 업체에 처리를 위탁하며 일부 데이터는 국외 서버에 저장됩니다 — Supabase(데이터베이스·스토리지, 미국), Vercel(호스팅·트래픽 분석, 미국), Kakao(지도 표시, 한국), PostHog(이용 행태 분석, 미국·키 설정 시). 각 수탁사는 관련 법령에 따른 보호 조치를 적용합니다." },
        { heading: "6. 정보주체의 권리", body: "이용자는 언제든지 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 요청은 아래 연락처로 접수하며 지체 없이 조치합니다. EU 거주자는 GDPR에 따른 권리(데이터 이동권 등)를 동일하게 행사할 수 있습니다." },
        { heading: "7. 안전성 확보 조치", body: "전송 구간 암호화(HTTPS), 데이터베이스 행 단위 접근 제어(RLS), 관리자 인증, 최소 권한 원칙을 적용합니다. 결제 정보는 도입 시 PG사가 처리하며 카드 정보를 직접 저장하지 않습니다." },
        { heading: "8. 쿠키", body: "언어 설정 유지를 위한 필수 쿠키를 사용합니다. 분석 도구 사용 시 브라우저의 추적 거부(DNT) 설정을 존중합니다." },
        { heading: "9. 개인정보 보호책임자", body: "문의·요청: " + CONTACT_EMAIL + ". 본 방침이 변경되는 경우 시행 7일 전 서비스 내 공지합니다." },
      ],
    },
    en: {
      title: "Privacy Policy",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Information We Collect", body: "Partners (restaurant listing): restaurant name, owner email, phone, address, business registration number. Users (when creating an account): email, nationality (optional), preferred language. Automatically: a language preference cookie and anonymized usage analytics. Device location is used only on your device to calculate distances and is never sent to or stored on our servers." },
        { heading: "2. Purposes", body: "Reviewing and operating restaurant listings, providing and improving the Service, remembering language settings, preventing abuse, and meeting legal obligations." },
        { heading: "3. Retention", body: "Data is deleted without delay upon account deletion or listing removal, except where retention is required by applicable laws (e.g., e-commerce regulations), in which case it is kept for the legally required period." },
        { heading: "4. Third-Party Disclosure", body: "We do not provide personal data to third parties without consent, except where required by law." },
        { heading: "5. Processors and International Transfer", body: "We use the following processors, and some data is stored on servers outside Korea — Supabase (database/storage, US), Vercel (hosting/analytics, US), Kakao (maps, Korea), PostHog (product analytics, US, when enabled). Each processor applies safeguards required by applicable law." },
        { heading: "6. Your Rights", body: "You may request access, correction, deletion, or restriction of your data at any time using the contact below. EU residents may exercise GDPR rights including data portability." },
        { heading: "7. Security", body: "We apply HTTPS encryption in transit, database row-level security, admin authentication, and the principle of least privilege. When payments launch, card data will be handled by a licensed payment provider and never stored by us." },
        { heading: "8. Cookies", body: "We use an essential cookie to remember your language. Our analytics respect your browser's Do-Not-Track setting." },
        { heading: "9. Contact", body: "Privacy inquiries: " + CONTACT_EMAIL + ". Changes to this policy will be announced in the Service 7 days before taking effect." },
      ],
    },
    zh: {
      title: "隐私政策",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 我们收集的信息", body: "合作伙伴（餐厅注册）：餐厅名称、联系邮箱、电话、地址、工商注册号。用户（创建账户时）：邮箱、国籍（可选）、首选语言。自动收集：语言偏好Cookie和匿名使用分析。设备位置仅在您的设备上用于计算距离，从不发送到或存储在我们的服务器上。" },
        { heading: "2. 用途", body: "审核和管理餐厅信息、提供和改善服务、记住语言设置、防止滥用以及履行法律义务。" },
        { heading: "3. 保留", body: "账户删除或列表删除后立即删除数据，除非适用法律（如电子商务法规）要求保留，届时将保留法律规定的期限。" },
        { heading: "4. 第三方披露", body: "未经同意，我们不向第三方提供个人数据，法律要求的情况除外。" },
        { heading: "5. 处理者和国际传输", body: "我们使用以下处理者，部分数据存储在韩国以外的服务器上 — Supabase（数据库/存储，美国），Vercel（托管/分析，美国），Kakao（地图，韩国），PostHog（产品分析，美国，启用时）。每位处理者均采用适用法律要求的安全措施。" },
        { heading: "6. 您的权利", body: "您可随时通过以下联系方式请求访问、更正、删除或限制您的数据。欧盟居民可行使GDPR权利，包括数据可携带权。" },
        { heading: "7. 安全", body: "我们采用传输加密（HTTPS）、数据库行级安全、管理员认证和最小权限原则。支付上线后，卡片数据将由持牌支付提供商处理，我们不存储。" },
        { heading: "8. Cookie", body: "我们使用一个必要Cookie来记住您的语言。我们的分析功能遵守您浏览器的禁止跟踪设置。" },
        { heading: "9. 联系", body: "隐私问题咨询：" + CONTACT_EMAIL + "。本政策的变更将在生效前7天在服务中公告。" },
      ],
    },
    ja: {
      title: "プライバシーポリシー",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 収集する情報", body: "パートナー（レストラン登録）：店舗名、代表メール、電話番号、住所、事業者登録番号。利用者（アカウント作成時）：メールアドレス、国籍（任意）、言語設定。自動収集：言語設定クッキーと匿名の利用分析データ。端末の位置情報は距離計算のためにのみ端末上で使用され、サーバーには送信・保存されません。" },
        { heading: "2. 目的", body: "レストラン登録の審査と運営、サービスの提供・改善、言語設定の保持、不正利用の防止、および法的義務の履行。" },
        { heading: "3. 保存期間", body: "アカウント削除またはリスト削除の際に速やかに削除します。ただし、電子商取引関連法令等により保存義務がある場合は、当該期間保管します。" },
        { heading: "4. 第三者への提供", body: "同意なく個人データを第三者に提供しません（法律上の要請がある場合を除く）。" },
        { heading: "5. 処理委託および国外移転", body: "次の処理業者を利用しており、一部データは韓国外のサーバーに保存されます — Supabase（データベース/ストレージ、米国）、Vercel（ホスティング/分析、米国）、Kakao（地図、韓国）、PostHog（プロダクト分析、米国、有効化時）。各業者は適用法令が求める保護措置を講じます。" },
        { heading: "6. お客様の権利", body: "ご自身のデータへのアクセス、訂正、削除、利用制限を以下の連絡先からいつでもご請求いただけます。EU在住の方はGDPRに基づく権利（データポータビリティ等）を行使できます。" },
        { heading: "7. セキュリティ", body: "通信の暗号化（HTTPS）、データベースの行レベルセキュリティ、管理者認証、最小権限の原則を適用しています。決済開始後、カード情報は認定決済業者が処理し、当社では保存しません。" },
        { heading: "8. クッキー", body: "言語設定を記憶するための必須クッキーを使用しています。分析機能はブラウザのDo-Not-Track設定を尊重します。" },
        { heading: "9. お問い合わせ", body: "プライバシーに関するお問い合わせ：" + CONTACT_EMAIL + "。本方針の変更は施行7日前にサービス内でお知らせします。" },
      ],
    },
    vi: {
      title: "Chính sách Quyền riêng tư",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Thông tin chúng tôi thu thập", body: "Đối tác (đăng ký nhà hàng): tên nhà hàng, email chủ sở hữu, điện thoại, địa chỉ, số đăng ký kinh doanh. Người dùng (khi tạo tài khoản): email, quốc tịch (tùy chọn), ngôn ngữ ưa thích. Tự động: cookie lưu ngôn ngữ và dữ liệu phân tích ẩn danh. Vị trí thiết bị chỉ được sử dụng trên thiết bị của bạn để tính khoảng cách, không bao giờ được gửi đến hoặc lưu trữ trên máy chủ của chúng tôi." },
        { heading: "2. Mục đích", body: "Xem xét và vận hành danh sách nhà hàng, cung cấp và cải thiện Dịch vụ, ghi nhớ cài đặt ngôn ngữ, ngăn chặn lạm dụng và đáp ứng các nghĩa vụ pháp lý." },
        { heading: "3. Lưu giữ", body: "Dữ liệu bị xóa ngay khi xóa tài khoản hoặc xóa danh sách, trừ khi pháp luật áp dụng yêu cầu lưu giữ (ví dụ: quy định thương mại điện tử), trường hợp đó dữ liệu được lưu giữ trong thời gian pháp luật quy định." },
        { heading: "4. Tiết lộ cho bên thứ ba", body: "Chúng tôi không cung cấp dữ liệu cá nhân cho bên thứ ba khi chưa có sự đồng ý, trừ khi pháp luật yêu cầu." },
        { heading: "5. Bộ xử lý và chuyển giao quốc tế", body: "Chúng tôi sử dụng các bộ xử lý sau, và một số dữ liệu được lưu trữ trên máy chủ bên ngoài Hàn Quốc — Supabase (cơ sở dữ liệu/lưu trữ, Mỹ), Vercel (lưu trữ/phân tích, Mỹ), Kakao (bản đồ, Hàn Quốc), PostHog (phân tích sản phẩm, Mỹ, khi được kích hoạt). Mỗi bộ xử lý áp dụng các biện pháp bảo vệ theo yêu cầu của pháp luật." },
        { heading: "6. Quyền của bạn", body: "Bạn có thể yêu cầu truy cập, sửa, xóa hoặc hạn chế dữ liệu của mình bất kỳ lúc nào qua địa chỉ liên hệ bên dưới. Cư dân EU có thể thực hiện các quyền GDPR bao gồm tính di chuyển dữ liệu." },
        { heading: "7. Bảo mật", body: "Chúng tôi áp dụng mã hóa HTTPS khi truyền, bảo mật hàng cơ sở dữ liệu, xác thực quản trị viên và nguyên tắc đặc quyền tối thiểu. Khi thanh toán ra mắt, dữ liệu thẻ sẽ do nhà cung cấp thanh toán có phép xử lý và không bao giờ được chúng tôi lưu trữ." },
        { heading: "8. Cookie", body: "Chúng tôi sử dụng một cookie cần thiết để ghi nhớ ngôn ngữ của bạn. Tính năng phân tích của chúng tôi tuân thủ cài đặt Không theo dõi của trình duyệt." },
        { heading: "9. Liên hệ", body: "Thắc mắc về quyền riêng tư: " + CONTACT_EMAIL + ". Những thay đổi đối với chính sách này sẽ được thông báo trong Dịch vụ 7 ngày trước khi có hiệu lực." },
      ],
    },
    th: {
      title: "นโยบายความเป็นส่วนตัว",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. ข้อมูลที่เรารวบรวม", body: "พาร์ทเนอร์ (การลงทะเบียนร้านอาหาร): ชื่อร้านอาหาร อีเมลเจ้าของ โทรศัพท์ ที่อยู่ หมายเลขทะเบียนธุรกิจ ผู้ใช้ (เมื่อสร้างบัญชี): อีเมล สัญชาติ (เป็นทางเลือก) ภาษาที่ต้องการ โดยอัตโนมัติ: คุกกี้การตั้งค่าภาษาและการวิเคราะห์การใช้งานแบบไม่ระบุตัวตน ตำแหน่งอุปกรณ์ใช้เฉพาะบนอุปกรณ์ของคุณเพื่อคำนวณระยะทาง และไม่เคยถูกส่งไปยังหรือจัดเก็บบนเซิร์ฟเวอร์ของเรา" },
        { heading: "2. วัตถุประสงค์", body: "การตรวจสอบและดำเนินการลงทะเบียนร้านอาหาร การให้และปรับปรุงบริการ การจดจำการตั้งค่าภาษา การป้องกันการใช้งานในทางที่ผิด และการปฏิบัติตามข้อผูกพันทางกฎหมาย" },
        { heading: "3. การเก็บรักษา", body: "ข้อมูลจะถูกลบทันทีเมื่อลบบัญชีหรือลบรายชื่อ เว้นแต่กฎหมายที่บังคับใช้ (เช่น กฎระเบียบการพาณิชย์อิเล็กทรอนิกส์) กำหนดให้เก็บรักษา ในกรณีนั้นจะเก็บรักษาไว้ตามระยะเวลาที่กฎหมายกำหนด" },
        { heading: "4. การเปิดเผยต่อบุคคลที่สาม", body: "เราไม่ให้ข้อมูลส่วนบุคคลแก่บุคคลที่สามโดยไม่ได้รับความยินยอม เว้นแต่กฎหมายกำหนด" },
        { heading: "5. ผู้ประมวลผลและการถ่ายโอนระหว่างประเทศ", body: "เราใช้ผู้ประมวลผลต่อไปนี้ และข้อมูลบางส่วนจัดเก็บบนเซิร์ฟเวอร์นอกเกาหลี — Supabase (ฐานข้อมูล/พื้นที่เก็บข้อมูล, สหรัฐอเมริกา), Vercel (โฮสติ้ง/การวิเคราะห์, สหรัฐอเมริกา), Kakao (แผนที่, เกาหลี), PostHog (การวิเคราะห์ผลิตภัณฑ์, สหรัฐอเมริกา, เมื่อเปิดใช้งาน) ผู้ประมวลผลแต่ละรายใช้มาตรการป้องกันตามที่กฎหมายที่บังคับใช้กำหนด" },
        { heading: "6. สิทธิ์ของคุณ", body: "คุณสามารถขอเข้าถึง แก้ไข ลบ หรือจำกัดข้อมูลของคุณได้ตลอดเวลาโดยใช้ที่ติดต่อด้านล่าง ผู้อยู่อาศัยในสหภาพยุโรปสามารถใช้สิทธิ์ตาม GDPR รวมถึงความสามารถในการพกพาข้อมูล" },
        { heading: "7. ความปลอดภัย", body: "เราใช้การเข้ารหัส HTTPS ระหว่างการส่ง ความปลอดภัยระดับแถวของฐานข้อมูล การตรวจสอบสิทธิ์ผู้ดูแลระบบ และหลักการสิทธิ์ขั้นต่ำ เมื่อการชำระเงินเริ่มต้น ข้อมูลบัตรจะได้รับการจัดการโดยผู้ให้บริการชำระเงินที่ได้รับอนุญาต และเราไม่เก็บข้อมูลนี้เลย" },
        { heading: "8. คุกกี้", body: "เราใช้คุกกี้ที่จำเป็นเพื่อจดจำภาษาของคุณ การวิเคราะห์ของเราเคารพการตั้งค่าไม่ติดตามของเบราว์เซอร์" },
        { heading: "9. ติดต่อ", body: "สอบถามเรื่องความเป็นส่วนตัว: " + CONTACT_EMAIL + " การเปลี่ยนแปลงนโยบายนี้จะได้รับการประกาศในบริการ 7 วันก่อนมีผลบังคับใช้" },
      ],
    },
    ru: {
      title: "Политика конфиденциальности",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Информация, которую мы собираем", body: "Партнёры (регистрация ресторана): название ресторана, адрес электронной почты владельца, телефон, адрес, номер бизнес-регистрации. Пользователи (при создании аккаунта): электронная почта, гражданство (по желанию), предпочитаемый язык. Автоматически: файл cookie с языковыми настройками и анонимная аналитика использования. Геолокация устройства используется только на вашем устройстве для расчёта расстояний и никогда не передаётся на наши серверы." },
        { heading: "2. Цели", body: "Проверка и ведение списков ресторанов, предоставление и улучшение Сервиса, запоминание языковых настроек, предотвращение злоупотреблений и соблюдение правовых обязательств." },
        { heading: "3. Хранение", body: "Данные удаляются без промедления при удалении аккаунта или листинга, если только применимое законодательство (например, нормы о защите прав потребителей в сфере электронной торговли) не требует их сохранения." },
        { heading: "4. Передача третьим лицам", body: "Мы не передаём персональные данные третьим лицам без согласия, за исключением случаев, предусмотренных законодательством." },
        { heading: "5. Обработчики и международная передача данных", body: "Мы используем следующих обработчиков, часть данных хранится на серверах за пределами Кореи — Supabase (база данных/хранилище, США), Vercel (хостинг/аналитика, США), Kakao (карты, Корея), PostHog (продуктовая аналитика, США, при включении). Каждый обработчик применяет меры защиты, требуемые применимым законодательством." },
        { heading: "6. Ваши права", body: "Вы вправе в любое время запросить доступ, исправление, удаление или ограничение обработки своих данных по контакту ниже. Жители ЕС могут воспользоваться правами по GDPR, включая право на портабельность данных." },
        { heading: "7. Безопасность", body: "Мы применяем шифрование HTTPS при передаче, безопасность на уровне строк базы данных, аутентификацию администраторов и принцип минимальных привилегий. Когда платежи запустятся, данные карт будет обрабатывать лицензированный платёжный провайдер, и мы их не храним." },
        { heading: "8. Файлы cookie", body: "Мы используем один необходимый файл cookie для запоминания языка. Наша аналитика соблюдает настройку Do-Not-Track вашего браузера." },
        { heading: "9. Контакт", body: "Вопросы о конфиденциальности: " + CONTACT_EMAIL + ". Изменения политики объявляются в Сервисе за 7 дней до вступления в силу." },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. المعلومات التي نجمعها", body: "الشركاء (تسجيل المطعم): اسم المطعم، بريد المالك الإلكتروني، الهاتف، العنوان، رقم تسجيل الأعمال. المستخدمون (عند إنشاء حساب): البريد الإلكتروني، الجنسية (اختياري)، اللغة المفضلة. تلقائيًا: ملف تعريف ارتباط تفضيل اللغة وبيانات تحليلية مجهولة. يُستخدم موقع الجهاز فقط على جهازك لحساب المسافات، ولا يُرسَل إلى خوادمنا أو يُخزَّن فيها." },
        { heading: "2. الأغراض", body: "مراجعة وإدارة قوائم المطاعم، وتوفير الخدمة وتحسينها، وتذكر إعدادات اللغة، ومنع الإساءة، والوفاء بالالتزامات القانونية." },
        { heading: "3. الاحتفاظ", body: "تُحذف البيانات فور حذف الحساب أو إزالة القائمة، إلا إذا استوجب ذلك القانون المعمول به (مثل لوائح التجارة الإلكترونية)، إذ يُحتفظ بها للمدة المقررة قانونًا." },
        { heading: "4. الإفصاح لأطراف ثالثة", body: "لا نقدم البيانات الشخصية لأطراف ثالثة دون موافقة، إلا في الحالات التي يوجبها القانون." },
        { heading: "5. المعالجون والنقل الدولي", body: "نستخدم المعالجين التاليين، وتُخزَّن بعض البيانات على خوادم خارج كوريا — Supabase (قاعدة البيانات/التخزين، الولايات المتحدة)، Vercel (الاستضافة/التحليلات، الولايات المتحدة)، Kakao (الخرائط، كوريا)، PostHog (تحليلات المنتج، الولايات المتحدة، عند التفعيل). يطبّق كل معالج الضمانات المطلوبة بموجب القانون المعمول به." },
        { heading: "6. حقوقك", body: "يمكنك في أي وقت طلب الوصول إلى بياناتك أو تصحيحها أو حذفها أو تقييد معالجتها عبر جهة الاتصال أدناه. يمكن لمقيمي الاتحاد الأوروبي ممارسة حقوقهم بموجب اللائحة العامة لحماية البيانات (GDPR) بما فيها قابلية نقل البيانات." },
        { heading: "7. الأمان", body: "نطبّق تشفير HTTPS أثناء النقل، وأمان قواعد البيانات على مستوى الصفوف، ومصادقة المشرفين، ومبدأ أدنى الصلاحيات. عند إطلاق المدفوعات، سيتولى معالج دفع مرخّص التعامل مع بيانات البطاقات، ولن نخزّنها أبدًا." },
        { heading: "8. ملفات تعريف الارتباط", body: "نستخدم ملف تعريف ارتباطًا واحدًا ضروريًا لتذكر لغتك. تحترم تحليلاتنا إعداد عدم التتبع في متصفحك." },
        { heading: "9. التواصل", body: "استفسارات الخصوصية: " + CONTACT_EMAIL + ". ستُعلَن التغييرات التي تطرأ على هذه السياسة في الخدمة قبل 7 أيام من سريانها." },
      ],
    },
    fa: {
      title: "سیاست حریم خصوصی",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. اطلاعاتی که جمع‌آوری می‌کنیم", body: "شرکا (ثبت رستوران): نام رستوران، ایمیل مالک، تلفن، آدرس، شماره ثبت کسب‌وکار. کاربران (هنگام ایجاد حساب): ایمیل، ملیت (اختیاری)، زبان ترجیحی. به‌طور خودکار: کوکی تنظیمات زبان و تحلیل‌های استفاده ناشناس. موقعیت دستگاه تنها روی دستگاه شما برای محاسبه فاصله استفاده می‌شود و هرگز به سرورهای ما ارسال یا ذخیره نمی‌شود." },
        { heading: "2. اهداف", body: "بررسی و مدیریت فهرست رستوران‌ها، ارائه و بهبود سرویس، به خاطر سپردن تنظیمات زبان، جلوگیری از سوءاستفاده و ایفای تعهدات قانونی." },
        { heading: "3. نگهداری", body: "داده‌ها بلافاصله پس از حذف حساب یا فهرست، پاک می‌شوند مگر اینکه قانون جاری (مثلاً مقررات تجارت الکترونیک) نگهداری را الزامی کند، در این صورت برای مدت قانونی نگهداری می‌شوند." },
        { heading: "4. افشا به اشخاص ثالث", body: "بدون رضایت، داده‌های شخصی را به اشخاص ثالث ارائه نمی‌دهیم، مگر در مواردی که قانون الزام کند." },
        { heading: "5. پردازندگان و انتقال بین‌المللی", body: "از پردازندگان زیر استفاده می‌کنیم و بخشی از داده‌ها روی سرورهای خارج از کره ذخیره می‌شوند — Supabase (پایگاه داده/ذخیره‌سازی، آمریکا)، Vercel (میزبانی/تحلیل، آمریکا)، Kakao (نقشه، کره)، PostHog (تحلیل محصول، آمریکا، در صورت فعال بودن). هر پردازنده تدابیر حفاظتی مورد نیاز قانون را اعمال می‌کند." },
        { heading: "6. حقوق شما", body: "می‌توانید در هر زمان از طریق آدرس تماس زیر درخواست دسترسی، اصلاح، حذف یا محدود کردن داده‌های خود را داشته باشید. ساکنان اتحادیه اروپا می‌توانند حقوق GDPR از جمله قابلیت حمل داده را اعمال کنند." },
        { heading: "7. امنیت", body: "رمزنگاری HTTPS در انتقال، امنیت سطح ردیف پایگاه داده، احراز هویت مدیر و اصل حداقل دسترسی را اعمال می‌کنیم. هنگامی که پرداخت‌ها راه‌اندازی شوند، داده‌های کارت توسط یک ارائه‌دهنده پرداخت مجاز پردازش می‌شوند و ما هرگز آن‌ها را ذخیره نمی‌کنیم." },
        { heading: "8. کوکی‌ها", body: "از یک کوکی ضروری برای به خاطر سپردن زبان شما استفاده می‌کنیم. تحلیل‌های ما تنظیمات عدم ردیابی مرورگر شما را رعایت می‌کنند." },
        { heading: "9. تماس", body: "سؤالات حریم خصوصی: " + CONTACT_EMAIL + ". تغییرات این سیاست ۷ روز قبل از اجرا در سرویس اطلاع‌رسانی خواهند شد." },
      ],
    },
  },

  partner: {
    ko: {
      title: "파트너(식당) 약관",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 등록 자격", body: "대한민국에서 적법하게 영업 중인 식음료 사업자만 등록할 수 있으며, 등록 시 유효한 사업자등록번호를 제출해야 합니다." },
        { heading: "2. 정보의 정확성", body: "파트너는 등록 정보(영업시간, 가격, 메뉴, 연락처 등)를 정확하게 유지할 책임이 있습니다. 변경 사항은 지체 없이 갱신해야 합니다." },
        { heading: "3. 인증 표시", body: "할랄, 비건, 코셔, 글루텐프리 등 인증 표시는 증빙 가능한 경우에만 사용해야 합니다. 허위 인증 표시는 즉시 삭제 및 등록 해지 사유가 되며, 이로 인한 법적 책임은 파트너에게 있습니다." },
        { heading: "4. 승인 및 게시", body: "등록 신청은 운영자 검수 후 게시됩니다. 운영자는 부정확하거나 부적절한 등록을 거절·삭제할 수 있습니다." },
        { heading: "5. 콘텐츠 라이선스", body: "파트너가 제공한 사진·텍스트는 서비스 내 표시 및 홍보 목적으로 사용할 수 있는 권한을 운영자에게 부여합니다. 파트너는 해당 콘텐츠에 대한 적법한 권리를 보유해야 합니다." },
        { heading: "6. 플랜", body: "기본 등록은 무료입니다. 유료 플랜(사진 추가, 메뉴 등록, 통계 등)이 도입되는 경우 별도 고지하며, 가입은 선택 사항입니다." },
        { heading: "7. 해지", body: "파트너는 언제든지 등록 삭제를 요청할 수 있습니다. 요청: " + CONTACT_EMAIL },
      ],
    },
    en: {
      title: "Partner (Restaurant) Terms",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Eligibility", body: "Only food & beverage businesses lawfully operating in Korea may register, and a valid business registration number is required." },
        { heading: "2. Accuracy", body: "Partners are responsible for keeping their listing (hours, prices, menu, contact, etc.) accurate and up to date." },
        { heading: "3. Certifications", body: "Halal, vegan, kosher, gluten-free and similar badges may be used only when verifiable. False certification claims result in immediate removal and termination, and the Partner bears any legal liability arising from them." },
        { heading: "4. Review and Publication", body: "Listings are published after review by the operator, who may reject or remove inaccurate or inappropriate listings." },
        { heading: "5. Content License", body: "Partners grant the operator a license to display and promote submitted photos and text within the Service, and must hold lawful rights to that content." },
        { heading: "6. Plans", body: "Basic listing is free. If paid plans (extra photos, menus, analytics, etc.) are introduced, they will be announced separately and remain optional." },
        { heading: "7. Termination", body: "Partners may request removal of their listing at any time: " + CONTACT_EMAIL },
      ],
    },
    zh: {
      title: "合作伙伴（餐厅）条款",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 资格", body: "仅限在韩国合法经营的餐饮企业注册，且需提供有效的工商注册号。" },
        { heading: "2. 准确性", body: "合作伙伴有责任保持其信息（营业时间、价格、菜单、联系方式等）的准确性并及时更新。" },
        { heading: "3. 认证", body: "清真、素食、犹太洁食、无麸质等标签仅在可证明的情况下使用。虚假认证声明将导致立即删除和终止，相关法律责任由合作伙伴承担。" },
        { heading: "4. 审核与发布", body: "信息经运营方审核后发布，运营方可拒绝或删除不准确或不适当的信息。" },
        { heading: "5. 内容许可", body: "合作伙伴授予运营方在服务内展示和推广所提交照片和文本的许可，且必须持有该内容的合法权利。" },
        { heading: "6. 套餐", body: "基本注册免费。如推出付费套餐（额外照片、菜单、分析等），将另行公告，且属于自愿选择。" },
        { heading: "7. 终止", body: "合作伙伴可随时申请删除其信息：" + CONTACT_EMAIL },
      ],
    },
    ja: {
      title: "パートナー（レストラン）規約",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 登録資格", body: "韓国で適法に営業する飲食事業者のみ登録でき、有効な事業者登録番号が必要です。" },
        { heading: "2. 情報の正確性", body: "パートナーは、登録情報（営業時間・価格・メニュー・連絡先等）を正確に維持する責任を負い、変更が生じた場合は速やかに更新してください。" },
        { heading: "3. 認証表示", body: "ハラール・ビーガン・コーシャ・グルテンフリー等の認証バッジは、証明可能な場合にのみ使用できます。虚偽の認証表示は即時削除および登録解除の原因となり、それに起因する法的責任はパートナーが負います。" },
        { heading: "4. 審査と掲載", body: "登録はオペレーターの審査後に掲載されます。不正確または不適切な登録は拒否・削除されることがあります。" },
        { heading: "5. コンテンツライセンス", body: "パートナーは提出した写真・テキストをサービス内での表示および宣伝目的で使用する権限をオペレーターに付与し、当該コンテンツへの適法な権利を保有しなければなりません。" },
        { heading: "6. プラン", body: "基本掲載は無料です。有料プラン（追加写真・メニュー・統計等）が導入される場合は別途案内し、加入は任意です。" },
        { heading: "7. 解約", body: "パートナーはいつでも掲載削除を申請できます：" + CONTACT_EMAIL },
      ],
    },
    vi: {
      title: "Điều khoản Đối tác (Nhà hàng)",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Điều kiện", body: "Chỉ các doanh nghiệp thực phẩm và đồ uống hoạt động hợp pháp tại Hàn Quốc mới được đăng ký, và cần cung cấp số đăng ký kinh doanh hợp lệ." },
        { heading: "2. Độ chính xác", body: "Đối tác có trách nhiệm giữ cho thông tin đăng ký (giờ mở cửa, giá, thực đơn, liên hệ, v.v.) chính xác và cập nhật." },
        { heading: "3. Chứng nhận", body: "Các nhãn Halal, thuần chay, Kosher, không chứa gluten và tương tự chỉ được sử dụng khi có thể xác minh. Tuyên bố chứng nhận sai dẫn đến xóa ngay lập tức và chấm dứt hợp đồng, và Đối tác chịu trách nhiệm pháp lý phát sinh." },
        { heading: "4. Xem xét và xuất bản", body: "Danh sách được xuất bản sau khi nhà điều hành xem xét, người có thể từ chối hoặc xóa các danh sách không chính xác hoặc không phù hợp." },
        { heading: "5. Giấy phép nội dung", body: "Đối tác cấp cho nhà điều hành giấy phép hiển thị và quảng bá ảnh và văn bản đã gửi trong Dịch vụ, và phải nắm giữ quyền hợp pháp đối với nội dung đó." },
        { heading: "6. Gói dịch vụ", body: "Đăng ký cơ bản miễn phí. Nếu các gói trả phí (ảnh thêm, menu, phân tích, v.v.) được giới thiệu, sẽ được thông báo riêng và là tùy chọn." },
        { heading: "7. Chấm dứt", body: "Đối tác có thể yêu cầu xóa danh sách của mình bất kỳ lúc nào: " + CONTACT_EMAIL },
      ],
    },
    th: {
      title: "ข้อกำหนดพาร์ทเนอร์ (ร้านอาหาร)",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. คุณสมบัติ", body: "เฉพาะธุรกิจอาหารและเครื่องดื่มที่ดำเนินการถูกกฎหมายในเกาหลีเท่านั้นที่สามารถลงทะเบียนได้ และต้องมีหมายเลขทะเบียนธุรกิจที่ถูกต้อง" },
        { heading: "2. ความถูกต้อง", body: "พาร์ทเนอร์มีหน้าที่รับผิดชอบในการรักษาความถูกต้องของรายชื่อ (เวลาทำการ ราคา เมนู ที่ติดต่อ ฯลฯ) และอัปเดตให้ทันสมัยอยู่เสมอ" },
        { heading: "3. การรับรอง", body: "ตราสัญลักษณ์ฮาลาล วีแกน โคเชอร์ ไม่มีกลูเตน และที่คล้ายกัน ใช้ได้เฉพาะเมื่อสามารถพิสูจน์ได้เท่านั้น การอ้างการรับรองเท็จส่งผลให้ถูกลบทันทีและยุติสัญญา และพาร์ทเนอร์รับผิดชอบทางกฎหมายที่เกิดขึ้น" },
        { heading: "4. การตรวจสอบและการเผยแพร่", body: "รายชื่อถูกเผยแพร่หลังจากผู้ให้บริการตรวจสอบ ซึ่งอาจปฏิเสธหรือลบรายชื่อที่ไม่ถูกต้องหรือไม่เหมาะสม" },
        { heading: "5. ใบอนุญาตเนื้อหา", body: "พาร์ทเนอร์มอบสิทธิ์การใช้งานแก่ผู้ให้บริการในการแสดงและส่งเสริมรูปภาพและข้อความที่ส่งมาในบริการ และต้องมีสิทธิ์ตามกฎหมายในเนื้อหานั้น" },
        { heading: "6. แผนบริการ", body: "การลงทะเบียนขั้นพื้นฐานฟรี หากมีการแนะนำแผนแบบชำระเงิน (รูปภาพเพิ่มเติม เมนู การวิเคราะห์ ฯลฯ) จะมีการประกาศแยกต่างหาก และเป็นตัวเลือก" },
        { heading: "7. การยุติ", body: "พาร์ทเนอร์สามารถขอลบรายชื่อได้ตลอดเวลา: " + CONTACT_EMAIL },
      ],
    },
    ru: {
      title: "Условия для партнёров (ресторанов)",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Требования к регистрации", body: "Регистрация доступна только предприятиям общественного питания, законно работающим в Корее; необходим действительный номер государственной регистрации." },
        { heading: "2. Достоверность информации", body: "Партнёры обязаны поддерживать актуальность данных в листинге (часы работы, цены, меню, контакты и т. д.) и своевременно вносить изменения." },
        { heading: "3. Знаки сертификации", body: "Значки «Халяль», «Веган», «Кошер», «Без глютена» и подобные разрешено использовать только при наличии подтверждения. Ложные заявления об сертификации влекут немедленное удаление и расторжение договора; юридическая ответственность за их последствия лежит на Партнёре." },
        { heading: "4. Проверка и публикация", body: "Листинги публикуются после проверки оператором; оператор вправе отклонить или удалить некорректные или несоответствующие требованиям листинги." },
        { heading: "5. Лицензия на контент", body: "Партнёры предоставляют оператору лицензию на отображение и продвижение загруженных фотографий и текстов в Сервисе и обязаны обладать законными правами на этот контент." },
        { heading: "6. Планы", body: "Базовый листинг бесплатен. Если будут введены платные планы (дополнительные фотографии, меню, аналитика и т. д.), они будут объявлены отдельно и останутся добровольными." },
        { heading: "7. Расторжение", body: "Партнёры вправе в любое время запросить удаление своего листинга: " + CONTACT_EMAIL },
      ],
    },
    ar: {
      title: "شروط الشريك (المطعم)",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. الأهلية", body: "يُسمح بالتسجيل فقط لمنشآت الأغذية والمشروبات العاملة بصورة قانونية في كوريا، ويُشترط تقديم رقم تسجيل تجاري ساري المفعول." },
        { heading: "2. الدقة", body: "يلتزم الشركاء بالحفاظ على دقة قوائمهم (أوقات العمل والأسعار والقائمة وجهة الاتصال وما إلى ذلك) وتحديثها باستمرار." },
        { heading: "3. الشهادات", body: "لا يجوز استخدام شارات الحلال والنباتية والكوشر وخالي من الغلوتين وما شابهها إلا حين تكون قابلة للإثبات. تؤدي ادعاءات الشهادات الكاذبة إلى الإزالة الفورية وإنهاء العقد، ويتحمل الشريك المسؤولية القانونية الناجمة عنها." },
        { heading: "4. المراجعة والنشر", body: "تُنشر القوائم بعد مراجعتها من قِبل المشغل، الذي يحق له رفض القوائم غير الدقيقة أو غير اللائقة أو حذفها." },
        { heading: "5. ترخيص المحتوى", body: "يمنح الشركاء المشغلَ ترخيصًا لعرض الصور والنصوص المُقدَّمة والترويج لها داخل الخدمة، ويجب أن يمتلكوا حقوقًا قانونية على هذا المحتوى." },
        { heading: "6. الخطط", body: "التسجيل الأساسي مجاني. إذا أُطلقت خطط مدفوعة (صور إضافية وقوائم طعام وتحليلات وما إلى ذلك)، فستُعلَن بشكل منفصل وستظل اختيارية." },
        { heading: "7. الإنهاء", body: "يمكن للشركاء طلب حذف قوائمهم في أي وقت: " + CONTACT_EMAIL },
      ],
    },
    fa: {
      title: "شرایط شریک (رستوران)",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. واجدین شرایط", body: "تنها کسب‌وکارهای مواد غذایی و نوشیدنی که به صورت قانونی در کره فعالیت می‌کنند می‌توانند ثبت‌نام کنند و به شماره ثبت کسب‌وکار معتبر نیاز است." },
        { heading: "2. دقت", body: "شرکا مسئول نگهداری دقیق و به‌روز فهرست خود (ساعات کاری، قیمت‌ها، منو، تماس و غیره) هستند." },
        { heading: "3. گواهینامه‌ها", body: "نشان‌های حلال، گیاه‌خوار، کوشر، بدون گلوتن و موارد مشابه فقط در صورتی می‌توانند استفاده شوند که قابل تأیید باشند. ادعاهای گواهینامه نادرست منجر به حذف فوری و فسخ قرارداد می‌شود و شریک مسئولیت قانونی ناشی از آن را بر عهده دارد." },
        { heading: "4. بررسی و انتشار", body: "فهرست‌ها پس از بررسی اپراتور منتشر می‌شوند و اپراتور می‌تواند فهرست‌های نادرست یا نامناسب را رد یا حذف کند." },
        { heading: "5. مجوز محتوا", body: "شرکا به اپراتور مجوز نمایش و تبلیغ عکس‌ها و متون ارسال‌شده در سرویس را می‌دهند و باید دارای حقوق قانونی آن محتوا باشند." },
        { heading: "6. طرح‌ها", body: "ثبت‌نام پایه رایگان است. اگر طرح‌های پرداختی (عکس‌های اضافی، منو، تحلیل و غیره) معرفی شوند، جداگانه اطلاع‌رسانی خواهند شد و اختیاری هستند." },
        { heading: "7. فسخ", body: "شرکا می‌توانند در هر زمان درخواست حذف فهرست خود را بدهند: " + CONTACT_EMAIL },
      ],
    },
  },

  refund: {
    ko: {
      title: "환불 정책",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 현재 서비스", body: "현재 KBite의 모든 기능(식당 탐색, 등록)은 무료이며 결제가 발생하지 않습니다. 본 정책은 향후 유료 기능 도입에 대비해 미리 안내하는 것입니다." },
        { heading: "2. 유료 구독 (도입 시)", body: "월 구독 결제 후 7일 이내에 유료 기능을 사용하지 않은 경우 전액 환불됩니다. 그 외 중도 해지 시 환불 없이 현재 결제 주기 종료일까지 혜택이 유지되고 자동 갱신이 중단됩니다." },
        { heading: "3. 오결제·중복 결제", body: "시스템 오류로 인한 오결제·중복 결제는 확인 즉시 전액 환불합니다." },
        { heading: "4. 처리 기간", body: "환불은 요청 접수 후 영업일 기준 3~5일 내에 결제 수단으로 처리되며, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령을 따릅니다." },
        { heading: "5. 문의", body: "환불 요청 및 문의: " + CONTACT_EMAIL },
      ],
    },
    en: {
      title: "Refund Policy",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Current Service", body: "All KBite features (discovery, listing) are currently free and no payments occur. This policy is provided in advance of future paid features." },
        { heading: "2. Paid Subscriptions (when introduced)", body: "A full refund is available within 7 days of a monthly subscription payment if paid features have not been used. Otherwise, cancelling mid-cycle stops auto-renewal and benefits continue until the end of the current billing period without a refund." },
        { heading: "3. Erroneous or Duplicate Charges", body: "Charges caused by system errors or duplication are fully refunded as soon as confirmed." },
        { heading: "4. Processing Time", body: "Refunds are processed to the original payment method within 3–5 business days of the request, in accordance with applicable consumer protection laws of Korea." },
        { heading: "5. Contact", body: "Refund requests and inquiries: " + CONTACT_EMAIL },
      ],
    },
    zh: {
      title: "退款政策",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 当前服务", body: "KBite的所有功能（发现、注册）目前均免费，不会产生任何费用。本政策为未来付费功能提前提供说明。" },
        { heading: "2. 付费订阅（推出后）", body: "月订阅付款后7天内，如未使用付费功能，可全额退款。否则，中途取消将停止自动续订，权益持续至当前计费周期结束，不予退款。" },
        { heading: "3. 错误或重复收费", body: "由系统错误或重复导致的费用一经确认即全额退款。" },
        { heading: "4. 处理时间", body: "退款将在申请后3-5个工作日内退回原支付方式，符合韩国适用的消费者保护法。" },
        { heading: "5. 联系", body: "退款申请及咨询：" + CONTACT_EMAIL },
      ],
    },
    ja: {
      title: "返金ポリシー",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. 現在のサービス", body: "KBiteのすべての機能（検索・登録）は現在無料であり、決済は発生しません。本ポリシーは将来の有料機能に備えて事前に提供するものです。" },
        { heading: "2. 有料サブスクリプション（導入時）", body: "月次サブスクリプション決済後7日以内に有料機能を利用していない場合は全額返金されます。それ以外の中途解約の場合は自動更新が停止し、現在の請求期間の終了まで特典が維持されますが返金はありません。" },
        { heading: "3. 誤請求・重複請求", body: "システムエラーや重複による請求は、確認次第全額返金します。" },
        { heading: "4. 処理期間", body: "返金は申請受付後3〜5営業日以内に元の支払い方法に処理されます。韓国の消費者保護関連法令に従います。" },
        { heading: "5. お問い合わせ", body: "返金申請・お問い合わせ：" + CONTACT_EMAIL },
      ],
    },
    vi: {
      title: "Chính sách Hoàn tiền",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Dịch vụ hiện tại", body: "Tất cả các tính năng KBite (khám phá, đăng ký) hiện tại đều miễn phí và không có thanh toán nào xảy ra. Chính sách này được cung cấp trước cho các tính năng trả phí trong tương lai." },
        { heading: "2. Đăng ký trả phí (khi được giới thiệu)", body: "Hoàn tiền đầy đủ có thể thực hiện trong vòng 7 ngày kể từ khi thanh toán đăng ký hàng tháng nếu chưa sử dụng các tính năng trả phí. Trường hợp khác, hủy giữa chu kỳ sẽ dừng tự động gia hạn và quyền lợi tiếp tục cho đến cuối kỳ thanh toán hiện tại mà không được hoàn tiền." },
        { heading: "3. Phí sai hoặc trùng lặp", body: "Các khoản phí do lỗi hệ thống hoặc trùng lặp sẽ được hoàn trả đầy đủ ngay khi được xác nhận." },
        { heading: "4. Thời gian xử lý", body: "Hoàn tiền được xử lý theo phương thức thanh toán ban đầu trong vòng 3–5 ngày làm việc kể từ khi nhận yêu cầu, theo luật bảo vệ người tiêu dùng hiện hành của Hàn Quốc." },
        { heading: "5. Liên hệ", body: "Yêu cầu hoàn tiền và thắc mắc: " + CONTACT_EMAIL },
      ],
    },
    th: {
      title: "นโยบายการคืนเงิน",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. บริการปัจจุบัน", body: "คุณสมบัติ KBite ทั้งหมด (ค้นพบ, ลงทะเบียน) ปัจจุบันฟรีและไม่มีการชำระเงินเกิดขึ้น นโยบายนี้จัดเตรียมไว้ล่วงหน้าสำหรับคุณสมบัติแบบชำระเงินในอนาคต" },
        { heading: "2. การสมัครสมาชิกแบบชำระเงิน (เมื่อแนะนำ)", body: "สามารถขอคืนเงินเต็มจำนวนภายใน 7 วันหลังจากการชำระเงินสมาชิกรายเดือน หากยังไม่ได้ใช้คุณสมบัติที่ชำระเงิน ไม่เช่นนั้น การยกเลิกกลางรอบจะหยุดการต่ออายุอัตโนมัติและสิทธิ์จะดำเนินต่อไปจนถึงสิ้นสุดรอบการเรียกเก็บเงินปัจจุบันโดยไม่มีการคืนเงิน" },
        { heading: "3. ค่าใช้จ่ายที่ผิดพลาดหรือซ้ำซ้อน", body: "ค่าใช้จ่ายที่เกิดจากข้อผิดพลาดของระบบหรือการซ้ำซ้อนจะได้รับการคืนเงินเต็มจำนวนทันทีที่ได้รับการยืนยัน" },
        { heading: "4. ระยะเวลาดำเนินการ", body: "การคืนเงินจะดำเนินการกลับไปยังวิธีการชำระเงินเดิมภายใน 3–5 วันทำการหลังจากได้รับคำขอ ตามกฎหมายคุ้มครองผู้บริโภคที่บังคับใช้ของเกาหลี" },
        { heading: "5. ติดต่อ", body: "คำขอคืนเงินและสอบถาม: " + CONTACT_EMAIL },
      ],
    },
    ru: {
      title: "Политика возврата",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. Текущий сервис", body: "Все функции KBite (поиск, листинг) в настоящее время бесплатны, и никаких платежей не происходит. Настоящая политика опубликована заблаговременно в связи с планируемым введением платных функций." },
        { heading: "2. Платные подписки (при введении)", body: "Полный возврат средств возможен в течение 7 дней с момента ежемесячной оплаты при условии, что платные функции не использовались. В остальных случаях при отмене подписки в середине цикла автоматическое продление прекращается, а доступ сохраняется до конца текущего расчётного периода без возврата средств." },
        { heading: "3. Ошибочные или дублирующиеся платежи", body: "Платежи, возникшие в результате системных ошибок или дублирования, полностью возвращаются сразу после подтверждения." },
        { heading: "4. Сроки обработки", body: "Возврат осуществляется на исходный способ оплаты в течение 3–5 рабочих дней с момента получения заявки в соответствии с применимым законодательством о защите прав потребителей Кореи." },
        { heading: "5. Контакт", body: "Запросы на возврат и вопросы: " + CONTACT_EMAIL },
      ],
    },
    ar: {
      title: "سياسة الاسترداد",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. الخدمة الحالية", body: "جميع ميزات KBite (الاستكشاف والتسجيل) مجانية حاليًا، ولا تُجرى أي مدفوعات. تُقدَّم هذه السياسة مسبقًا استعدادًا للميزات المدفوعة المستقبلية." },
        { heading: "2. الاشتراكات المدفوعة (عند إطلاقها)", body: "يمكن الاسترداد الكامل في غضون 7 أيام من دفع الاشتراك الشهري إذا لم تُستخدم الميزات المدفوعة. وإلا، يؤدي الإلغاء في منتصف الدورة إلى إيقاف التجديد التلقائي مع استمرار الاستفادة حتى نهاية دورة الفوترة الحالية دون أي استرداد." },
        { heading: "3. الرسوم الخاطئة أو المكررة", body: "تُردّ الرسوم الناجمة عن أخطاء في النظام أو التكرار بالكامل بمجرد تأكيدها." },
        { heading: "4. مدة المعالجة", body: "تُعالَج المبالغ المستردة إلى وسيلة الدفع الأصلية في غضون 3-5 أيام عمل من تلقّي الطلب، وفقًا لقوانين حماية المستهلك المعمول بها في كوريا." },
        { heading: "5. التواصل", body: "طلبات الاسترداد والاستفسارات: " + CONTACT_EMAIL },
      ],
    },
    fa: {
      title: "سیاست بازپرداخت",
      effectiveDate: "2026-06-11",
      sections: [
        { heading: "1. سرویس فعلی", body: "تمام امکانات KBite (کشف، فهرست‌نویسی) در حال حاضر رایگان هستند و هیچ پرداختی انجام نمی‌شود. این سیاست از قبل برای امکانات پرداختی آینده ارائه شده است." },
        { heading: "2. اشتراک‌های پرداختی (هنگام معرفی)", body: "بازپرداخت کامل در صورتی امکان‌پذیر است که در ۷ روز از پرداخت ماهیانه اشتراک، از امکانات پرداختی استفاده نشده باشد. در غیر این صورت، لغو در وسط چرخه، تمدید خودکار را متوقف می‌کند و مزایا تا پایان دوره صورتحساب جاری ادامه می‌یابند بدون بازپرداخت." },
        { heading: "3. هزینه‌های اشتباه یا تکراری", body: "هزینه‌هایی که به دلیل خطای سیستم یا تکرار ایجاد شده‌اند، به محض تأیید به طور کامل بازپرداخت می‌شوند." },
        { heading: "4. مدت پردازش", body: "بازپرداخت‌ها ظرف ۳ تا ۵ روز کاری پس از دریافت درخواست به روش پرداخت اصلی پردازش می‌شوند و با قوانین حمایت از مصرف‌کننده کره مطابقت دارد." },
        { heading: "5. تماس", body: "درخواست‌های بازپرداخت و سؤالات: " + CONTACT_EMAIL },
      ],
    },
  },
};

export const POLICY_SLUGS: PolicySlug[] = [
  "terms",
  "privacy",
  "partner",
  "refund",
];

export function isPolicySlug(value: string): value is PolicySlug {
  return (POLICY_SLUGS as string[]).includes(value);
}
