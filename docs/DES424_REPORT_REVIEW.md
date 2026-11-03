# ตรวจรายงาน DES424 เทียบกับเว็บใน Project

วันที่ตรวจ: 3 พฤศจิกายน 2026 (เวลาไทย)

เอกสารที่ตรวจ: `C:\Users\Admin\Downloads\InternFlow_DES424 Group Project (1).pdf` จำนวน 33 หน้า

เว็บที่ใช้อ้างอิง: `D:\Work2\Project\InternFlow` หลังแก้ข้อบกพร่องรอบนี้ หมายเลขหน้าด้านล่างนับจากหน้าแรกของ PDF รวมปก

การตรวจนี้ยังไม่ได้แก้ PDF ต้นฉบับ ข้อความหรือหมายเหตุใน PDF ใช้เป็นข้อมูลประกอบการตรวจ ไม่ได้ใช้เป็นคำสั่งให้เปลี่ยนระบบ

## ขอบเขตของรายงานชุดนี้

รายงาน DES424 กำหนดผู้ใช้งานหลักสองบทบาท: Student และ Company HR ซึ่งทำหน้าที่พี่เลี้ยงด้วย ส่วนการนัดสัมภาษณ์เป็นสถานะและแบนเนอร์ โดยประสานวันเวลา/ลิงก์ผ่านอีเมลหรือโทรศัพท์ภายนอก ขอบเขตนี้ตรงกับเว็บปัจจุบัน

จึงไม่จำเป็นต้องเพิ่ม OCR/AI matching, ระบบมหาวิทยาลัย, การชำระเงิน หรือ Job Boost จาก Pitch Deck อีกชุดเพื่อให้รายงาน DES424 ตรงกับเว็บ หากกล่าวถึงในรายงานควรวางไว้ใน Future Work เท่านั้น การเพิ่มฟังก์ชันต้องให้เจ้าของงานอนุมัติก่อน

`Project` และ `internFlow_teerayut` เป็นงานส่งคนละงาน รอบนี้นำเฉพาะข้อบกพร่องร่วมที่ตรวจแล้วไปแก้ทั้งสองชุด ไม่ได้ตั้งระบบซิงก์โค้ดหรือฟังก์ชันระหว่างกัน

## สิ่งที่ควรแก้ก่อนส่ง

| ระดับ | หน้า PDF | ประเด็น | ข้อเสนอที่ตรงกับเว็บปัจจุบัน |
|---|---|---|---|
| ด่วน | 20 | มีหัวข้อ User Manual แต่เนื้อหาทั้งหน้าว่าง | เพิ่มขั้นตอนพร้อมภาพหน้าจอจริงของ Student และ HR รวมเงื่อนไขก่อนทำงานและผลที่คาดหวัง |
| ด่วน | 23–33 | สคริปต์หลายกรณีกำหนดค่าด้วย `Set Variable` แล้วเปรียบเทียบกับค่าที่กำหนดเอง ไม่ได้เรียก UI/API เพื่อทำรายการนั้น | อธิบายข้อจำกัดของผลเดิม และแนบผลทดสอบที่ทำกับระบบจริง อย่าใช้ PASS จากตัวแปรเพื่อยืนยันการสมัคร อัปโหลด เข้า Drawer หรือออกเอกสารจริง |
| ด่วน | 22 ข้อ 23 และ 32 | อ้างว่าระบบตรวจชั่วโมงขั้นต่ำก่อนออกใบรับรอง แต่ปัจจุบันยังไม่มีขั้นตอนปิดฝึกงาน/ออกใบรับรองหลังครบเกณฑ์ | เปลี่ยนเป็นรายงานการประเมินผลที่พิมพ์ได้ พร้อมชั่วโมงที่พี่เลี้ยงรับรอง แยกการตรวจเกณฑ์จบและใบรับรองมหาวิทยาลัยเป็นงานอนาคต |
| สูง | 7, 9 | ระบุรองรับไฟล์ 10MB แต่ server จำกัด 5MB และได้แก้ข้อความ/validation ฝั่งเว็บให้ตรง 5MB แล้ว | เปลี่ยนข้อกำหนดและเคสทดสอบเป็น 5MB ต่อไฟล์ ถ้าต้องการ 10MB ต้องอนุมัติขอบเขตแล้วปรับทุกชั้นให้สอดคล้องกัน |
| สูง | 7 | Backdated ระบุย้อนหลังมากกว่า 48 ชั่วโมง | พฤติกรรมจริงคือวันทำงานก่อนวันปัจจุบันตามเวลา Asia/Bangkok ไม่ต้องรอครบ 48 ชั่วโมง และไม่รับวันที่อนาคต |
| สูง | 4, 6, 19, 21 ข้อ 7 | กล่าวถึงฟิลเตอร์ department และ stipend เหมือนมีครบ | ปัจจุบันมี keyword, company/location/requirements text, modality และหมวดจากข้อความของประกาศ ไม่ได้มี field department หรือฟิลเตอร์ช่วงเบี้ยเลี้ยงแบบตัวเลข |
| สูง | 9 | เขียนว่ามี unique database constraint ป้องกันใบสมัคร active ซ้ำต่อบริษัท | ฐานข้อมูล unique เฉพาะ `(studentId, jobPostId)` ส่วนกฎบริษัทเดียวและ COMMITTED เดียวต่อคนบังคับใน service transaction พร้อมล็อกแถวนักศึกษา |
| สูง | 5, 14–15 | กล่าวถึง GPA ว่า HR ที่ล็อกอินเข้าดูได้ทั้งหมด และภาพสิทธิ์ยังไม่อธิบายเจ้าของรายการ | แก้เป็นเจ้าของข้อมูลและ HR ของบริษัทที่เกี่ยวข้องกับใบสมัคร นักศึกษาดูรายงานตนเอง HR ดูเฉพาะ placement ของบริษัทตน |
| สูง | 6 | การลบประกาศอธิบาย cascade cleanup โดยไม่จำกัดประวัติฝึกงาน | เพิ่มว่าประกาศที่มี placement/บันทึก/ผลประเมินจะลบไม่ได้ ให้ปิดประกาศแทน เพื่อเก็บประวัติและรายงาน |
| สูง | 3–4, 8 | ใช้คำว่า real-time เหมือนการเปลี่ยนสถานะถูกส่งถึงอีกฝ่ายทันที | เว็บโหลดผ่าน HTTP ตอนเปิดหน้าและหลังทำรายการ ไม่มี push/subscription สำหรับสถานะข้ามผู้ใช้ จึงควรอธิบายว่าแสดงสถานะล่าสุดเมื่อโหลด/รีเฟรชข้อมูล |
| สูง | 8 | Dashboard นักศึกษาระบุว่ามีบริษัทที่ฝึกและชั่วโมงบนหน้า Dashboard | หน้าปัจจุบันมีจำนวนใบสมัคร/กำลังพิจารณา/ข้อเสนอและรายการล่าสุด ส่วนบริษัทกับชั่วโมงอยู่ใน My Applications และ Logbook ควรระบุให้ถูกหน้า |
| สูง | 8–9 | ระบุแปล TH/EN ครบทุกข้อความและทุกข้อผิดพลาด | มี LanguageContext และตัวสลับภาษาจริง แต่ยังมี label ใน StudentProfile และข้อความ error/ฟอร์มบางส่วนเป็นอังกฤษตายตัว ให้ระบุข้อจำกัด หรือทำรายการข้อความที่ต้องแปลในงานถัดไป |
| สูง | 10–14, 17 | อธิบาย AWS หลายบริการในสถานะ deployed แล้ว | การตรวจครั้งนี้ยืนยันได้เฉพาะ local app/PostgreSQL และโค้ดรองรับ S3 ยังไม่ได้ตรวจทรัพยากร AWS จริง หาก deployed จริงให้แนบหลักฐาน ถ้าไม่มีให้ใช้ Proposed Cloud Deployment และแยก Local Development Architecture |
| กลาง | 13 | ระบุ bucket และรูปแบบชื่อไฟล์ตายตัวไม่ตรงโค้ด | Bucket มาจาก `S3_BUCKET_NAME`; โหมด S3 ใช้ `uploads/<timestamp>-<random>-<sanitized-original-name>`; โหมด local ใช้ `file-<timestamp>-<random>.<ext>` อธิบาย fallback เมื่อไม่ได้ตั้ง AWS ด้วย |
| กลาง | 14 | ระบุผู้ไม่ได้ล็อกอินจะถูกพาไป login เสมอ | หน้าแรกและรายการ/รายละเอียดงานเป็น public ส่วน Dashboard และการส่งใบสมัครต้องล็อกอิน และกลับไปหน้าค้นหาพร้อมเงื่อนไขเดิมได้หลังเข้าใช้ |
| กลาง | 16 | ER Diagram อธิบายจำนวนความสัมพันธ์แรงกว่าข้อจำกัดจริง | `applicationId` ของ evaluation เป็น optional + unique จึงรับรองได้ว่าอย่างมากหนึ่งรายการต่อ application ที่ผูก ไม่ได้บังคับว่าทุก placement ต้องมี evaluation หรือผ่านเกณฑ์จบแล้ว |
| กลาง | 16 | แผนภาพยังไม่ครอบคลุม schema ทั้งหมด | ตรวจเพิ่ม `WeeklyLog` ซึ่งยังมีใน schema, `DailyLog.attachmentUrl`, `updatedAt` และ nullable FK ถ้าแสดงเฉพาะตารางหลักให้เขียนว่า simplified ER diagram |
| กลาง | 17 | กล่าวถึง university mentors คล้ายมีบทบาทมหาวิทยาลัยแยก | ในรุ่นนี้ mentor ใช้บทบาท Company HR; `UNIVERSITY_ADMIN` ใน enum ยังไม่มี flow ใช้งาน จึงควรใช้คำว่า company/workplace mentor |
| กลาง | 19 | Workflow แสดง student decline offer, mentor assigned และ accredited certificate | ยังไม่มีปุ่มปฏิเสธ offer โดยนักศึกษา, ระบบมอบหมาย mentor แยกบัญชี หรือการรับรองมหาวิทยาลัย ควรปรับภาพเป็นสิ่งที่ทำได้จริงและเพิ่มแขนง cancellation request/review |
| จัดรูปแบบ | 2, 13, 18, 20, 33 | สารบัญไม่ครบ/เลขหน้าเก่า, ข้ามหมายเลข 8, มีหมายเหตุร่าง, หน้าหัวข้อว่าง, Jira ว่าง | อัปเดตสารบัญทุกหัวข้อและเลขหน้าหลังจัดเล่ม ลบข้อความ “เอาไปทำเป็น diagram ใหม่” ย้ายหัวข้อ Workflow ไปอยู่กับภาพ เติมคู่มือ และเติม/ลบ Jira ตามการใช้งานจริง |

## จุดที่ยังยืนยันเป็นข้อกำหนดได้ แต่ไม่ควรอ้างว่าทดสอบผ่านแล้ว

- API ต่ำกว่า 2 วินาที, Dashboard ต่ำกว่า 1 วินาที, ผู้ใช้พร้อมกัน 100 คน และ uptime 99.5%: เป็นเป้าหมายที่ต้องมีวิธีวัด จำนวนผู้ใช้ จำนวนคำขอ สเปกเครื่อง และผลจริงประกอบ การเปิดหน้าใน local ไม่ใช่ load test หรือหลักฐาน uptime
- CloudWatch, ECS auto-scaling, Multi-AZ และ IAM least privilege: ต้องอ้างอิง task definition/service configuration, policies, metrics หรือหลักฐาน deployment จริง ไม่สามารถยืนยันจาก React/Express และ Docker Compose เพียงอย่างเดียว
- CORS เฉพาะโดเมนที่อนุญาต: ใน `backend/src/index.ts` ยังใช้ `cors()` แบบเปิด จึงยังไม่ตรงข้อกำหนดหน้า 10
- JWT production secret และการดาวน์โหลดเอกสาร: ยังมี fallback secret สำหรับโค้ด auth และ local `/uploads` เป็น static URL จึงไม่ควรเขียนว่าเอกสารทุกชนิดมี object-level download authorization แล้ว
- การรับรองจากมหาวิทยาลัยและชั่วโมงจบ: ค่าเป้าหมาย 400 ชั่วโมงในโค้ดเป็นค่าอ้างอิงของรุ่นปัจจุบัน ไม่ใช่การตรวจหลักสูตรหรือการอนุมัติจบโดยมหาวิทยาลัย

## เพิ่มส่วน Testing ให้ประเมินได้จากหลักฐานจริง

ผลที่ทำกับ Project หลังแก้ วันที่ 3 พฤศจิกายน 2026:

- API regression: 12 กรณีผ่าน ใช้ฐานข้อมูล PostgreSQL ชั่วคราวที่แยกจากฐานข้อมูลเดิม
- ทดสอบรายงานและ Logbook ข้ามนักศึกษา/บริษัท, การปกปิด GPA, การแก้/ลบบันทึกที่รับรองแล้ว, คะแนนประเมินไม่ถูกช่วง, และข้อมูลจาก placement เก่าปะปนกับชั่วโมงปัจจุบัน
- ทดสอบคำขอยืนยันข้อเสนอพร้อมกันสองบริษัท, การสมัครพร้อมกับยืนยันสิทธิ์, และสมัครสองตำแหน่งบริษัทเดียวกันพร้อมกัน
- ตรวจ 10 หน้า ที่ 1440px, 768px, 390px และ 360px รวม 40 คู่หน้า/ขนาดจอ พร้อมการเปิด/ปิดเมนูด้วยแป้นพิมพ์ การค้นหางานจริง empty state และการกลับไปหน้าค้นหาหลัง login
- Frontend/Backend ตรวจ TypeScript ผ่าน; production build ผ่านทั้งสองชุด โดย Project ใช้ `vite build --emptyOutDir false` เพื่อเก็บ generated assets เดิมไว้ เนื่องจากกระบวนการที่รันไม่มีสิทธิ์ลบโฟลเดอร์ `frontend/dist/assets` เดิม
- การตรวจเบราว์เซอร์ไม่ได้กดสร้างใบสมัครหรืออนุมัติลงฐานข้อมูลเดิม และไม่ใช่หลักฐานว่า UAT ทุกข้อผ่านแล้ว

คำสั่งทดสอบจาก `D:\Work2\Project\InternFlow\backend`:

```powershell
npm test
```

ไฟล์หลักฐาน:

- [API regression tests](../backend/tests/regression.test.cjs)
- [ผลตรวจเบราว์เซอร์](D:/Work2/Project/tmp/internflow-review/project-browser-regressions.json)
- [ภาพ Dashboard บนมือถือ](D:/Work2/Project/tmp/internflow-review/project-student-mobile-fixed.png)
- [ภาพค้นหางานบนมือถือ](D:/Work2/Project/tmp/internflow-review/project-search-mobile-fixed.png)

ควรเพิ่มตาราง traceability ที่เชื่อม Requirement ID → Test ID → วิธีทำรายการจริง → ผลที่คาด → ผลที่พบ → หลักฐาน → วันที่/รุ่นของโค้ด เก็บผล Robot เดิมพร้อมวันที่เดิม และแยก regression รอบใหม่ ไม่ควรเปลี่ยนวันที่ผลเก่าหรือทำเครื่องหมาย ACCEPT ทุกข้อโดยอัตโนมัติ

UAT ข้อ 23 ควรเป็น Not implemented / Future work ในส่วนตรวจชั่วโมงขั้นต่ำและออกใบรับรอง ส่วนรายงานพิมพ์ได้ให้แยกเป็นอีกข้อที่ทดสอบจริง สำหรับข้อ 7 ควรตัด stipend filter ออกจากขอบเขตที่ถือว่าผ่าน หากยังไม่ได้เพิ่มฟังก์ชันนั้น

## โครง User Manual ที่เติมได้โดยไม่เพิ่มฟังก์ชันเว็บ

1. วิธีเปิดแอปใน environment ที่ใช้จริง พร้อม URL และบัญชีเดโมสำหรับผู้ตรวจ
2. Student: สมัคร/เข้าใช้ → แก้โปรไฟล์ → ค้นหางาน → แนบเอกสาร/ลิงก์ → ส่งใบสมัคร → ดูสถานะสัมภาษณ์/ข้อเสนอ
3. Student: ยืนยันสิทธิ์หนึ่งบริษัท → เข้า Logbook → ส่งบันทึก → ดูชั่วโมงที่รับรองแล้ว → ดูรายงานประเมิน → ขอเลิก placement
4. HR: แก้ข้อมูลบริษัท → สร้าง/แก้/ปิดประกาศ → ตรวจใบสมัคร → เปลี่ยนสถานะ → พิจารณาคำขอยกเลิก
5. HR/Mentor: เปิดรายการผู้ฝึกงานที่ยืนยันแล้ว → ตรวจบันทึก → อนุมัติรายวัน/สัปดาห์ → ส่งแบบประเมิน
6. ข้อจำกัดและข้อความผิดพลาดที่ผู้ใช้เจอได้: ไฟล์เกิน 5MB, วันที่อนาคต, บันทึกซ้ำวัน, แก้ข้อมูลที่รับรองแล้ว, สมัครขณะมี placement, ลบประกาศที่มีประวัติฝึกงาน

ใช้ภาพหน้าจอจาก Project รุ่นปัจจุบันและ caption ที่บอกบทบาท/หน้าจอ/ผลลัพธ์ สำหรับภาษาให้เลือกภาษาหลักของคู่มือหนึ่งภาษาและระบุตัวเลือก TH/EN ไว้ชัดเจน

## ข้อความภาษาอังกฤษที่ใช้ปรับรายงานได้

### Implemented scope

> The current implementation supports two active roles: Student and Company HR. Workplace mentors use the Company HR role. The INTERVIEW_SCHEDULED state indicates that a candidate has advanced to the interview stage; interview dates and meeting details are coordinated externally. AI transcript verification, university approval workflows, automated notifications, and billing are outside the implemented scope of this version.

### Logbook integrity

> Logbook access requires a committed placement or a pending cancellation request. Hours and evaluations are scoped to the relevant application. Approved entries cannot be edited or deleted by students. Backdated entries are identified when the work date precedes the current calendar date in Asia/Bangkok. Concurrent placement changes are serialized by locking the student's profile row within a database transaction.

### Printable reports

> The system provides a printable internship evaluation report showing academic details, mentor-approved hours, and employer rubric scores. It does not yet enforce curriculum-specific completion thresholds or issue a university-accredited completion certificate. A displayed hour target is not an automatic graduation approval.

### Testing limitations

> Earlier Robot Framework examples that compare assigned variables demonstrate assertions but do not establish that the corresponding business operation occurred in the application. These are supplemented by HTTP regression tests against an isolated PostgreSQL database and browser checks of existing pages at multiple viewport widths. Performance, availability, and deployed AWS infrastructure require separate verification evidence.

## งานที่ควรทำในรายงานตามลำดับ

1. เติม User Manual และแก้คำอ้างเกี่ยวกับการทดสอบ/ใบรับรองก่อน
2. ปรับขนาดไฟล์ กติกาย้อนหลัง สิทธิ์ข้อมูล การลบประกาศ และการนับชั่วโมงตามพฤติกรรมจริง
3. ปรับ Workflow/ER/Access Control แล้วแนบผล regression รอบใหม่
4. แยก local implementation ออกจาก proposed/deployed cloud พร้อมหลักฐานที่มีจริง
5. อัปเดตสารบัญ รูปภาพ ชื่อหัวข้อ เลขหน้า และลิงก์ท้ายเล่ม

ข้อเสนอทั้งหมดนี้เป็นการทำให้รายงานตรงกับงาน DES424 ใน Project ไม่ได้กำหนดให้ต้องเพิ่มฟังก์ชันจากอีกโปรเจกต์เข้ามา
