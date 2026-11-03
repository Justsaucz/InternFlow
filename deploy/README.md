# InternFlow Project: เตรียม deploy ตามบริการที่ยืนยันแล้ว

สถานะ 3 พฤศจิกายน 2026: เตรียมและทดสอบในเครื่องแล้ว ยังไม่มี AWS account และยังไม่ได้สร้างทรัพยากรบน AWS คู่มือนี้ใช้เฉพาะ `Project/InternFlow` ไม่ได้คัดลอกโค้ดไปงาน Teerayut

## โครงที่ใช้

```text
Browser --HTTPS--> S3: frontend/index.html#/dashboard
       \--HTTPS--> ALB (public subnets) --> ECS Fargate (private subnets)
                                             |--> RDS PostgreSQL 16 (isolated subnets)
                                             \--> S3 private upload objects

Supporting: ECR images / IAM roles / CloudWatch logs
Network: VPC, public/private/DB subnets, Security Groups,
         outbound routing via NAT or the required VPC endpoints
```

ใช้ S3, ECS, ECR, RDS, IAM, CloudWatch, VPC, Subnets, ALB และ Security Groups ตามภาพที่ผู้ใช้ยืนยัน ไม่มี CloudFront, Secrets Manager, Amplify หรือ Route 53 ในชุดเริ่มต้นนี้

เส้นอัปโหลดในภาพต้องออกจาก **ECS ไป S3** ส่วน RDS เก็บข้อมูลและ URL/metadata ไม่ได้ส่งไฟล์เข้า S3 เอง S3 เป็น regional service ที่อยู่นอก subnet ของแอป

## เหตุผลที่ไม่ต้องใช้ CloudFront

S3 **website endpoint** เป็น HTTP และไม่มี HTTPS แต่ S3 **REST object endpoint** มี HTTPS จึงให้เปิด `https://<frontend-bucket>.s3.ap-southeast-1.amazonaws.com/index.html#/` แล้วใช้ HashRouter ฝั่ง React การ refresh จะยังขอไฟล์ index.html เดิม ไม่มีการ rewrite เส้นทางที่ S3 หรือ CDN

Frontend build สำหรับ cloud ใช้ `VITE_ROUTER_MODE=hash`, `VITE_API_URL=https://<api-domain>` และตั้ง CORS ของ backend เป็น origin ของ S3 โดยไม่มี `/index.html` ต่อท้าย ตัวอย่าง `https://<frontend-bucket>.s3.ap-southeast-1.amazonaws.com` การรัน Vite ในเครื่องยังใช้ BrowserRouter ตามเดิม

**ALB HTTPS ยังต้องมี certificate และ domain ที่ควบคุมได้** ตรวจว่าบัญชีอาจารย์มี certificate/domain ให้ใช้หรือไม่ สามารถใช้ certificate จาก CA ที่เชื่อถือได้และอัปโหลดเข้า IAM ซึ่งอยู่ในรายการบริการแล้ว หากจะใช้ ACM แทน ต้องตกลงการเพิ่มส่วนนี้ก่อน คู่มือนี้ไม่ได้ซื้อ domain หรือสร้าง certificate ใด ๆ และไม่อ้างว่า ALB DNS เปล่า ๆ จะใช้ HTTPS ที่เชื่อถือได้ทันที

## ไฟล์ที่เตรียม

| ไฟล์ | ใช้ทำอะไร |
| --- | --- |
| `backend/Dockerfile.production` | Node 24, build TypeScript/Prisma, runtime ไม่ใช่ dev server, รันเป็น node user, มี RDS CA bundle |
| `frontend/Dockerfile.production` | build frontend; target `export` ส่งเฉพาะ dist สำหรับ S3; target `runtime` เป็น Nginx สำหรับตรวจในเครื่อง |
| `compose.local.yml` | ฐานข้อมูลและ services ทดสอบแยกจากฐานข้อมูลแอปเดิม ไม่มีการสร้าง AWS |
| `aws/ecs-task-definition.json` | แบบฟอร์ม task สำหรับ API ยังต้องแทนค่า REPLACE_* |
| `aws/task-role-policy.json` | ให้แอปเข้าถึงเฉพาะ upload prefix ใน S3 |
| `aws/execution-role-envfile-policy.json` | ให้ ECS อ่าน env file เฉพาะ object ใน private S3 config bucket |
| `aws/api.env.example` | ตัวอย่าง DATABASE_URL/JWT_SECRET ไม่มีรหัสจริง |
| `aws/frontend-bucket-policy.json` | public read เฉพาะ bucket ที่มี frontend build ไม่มี CV หรือ secrets |
| `aws/private-bucket-policy.json` | ปฏิเสธ HTTP สำหรับ private bucket; ใช้แยกกับ upload/config bucket และเปิด Block Public Access |

ชุด JSON เป็น template สำหรับกรอกค่าจริง ไม่ใช่ infrastructure ที่สร้างแล้ว และยังไม่ผ่าน AWS-side validation เพราะยังไม่มีบัญชี

## ตรวจในเครื่อง

จากโฟลเดอร์ `InternFlow` สร้าง `deploy/.env.local` โดยคัดลอกจาก `.env.example` และใส่ `DB_PASSWORD` กับ `JWT_SECRET` เป็นค่าที่สุ่มเอง ใช้ hex สำหรับ DB_PASSWORD เพื่อไม่ต้อง URL-encode ตัวอย่างสร้างแต่ละค่า: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ห้าม commit `.env.local`

```powershell
docker compose -f deploy/compose.local.yml --env-file deploy/.env.local up -d --build --wait
```

เปิด `http://127.0.0.1:8088` ฐานข้อมูลของ compose ใช้ volume `internflow-cloudcheck_dbdata` และไม่เปิด port DB ออก host จึงไม่ชนกับฐานข้อมูลเดิม local checks อนุญาต HTTP เฉพาะ loopback และ local storage ด้วย flags ที่ระบุชัด ห้ามนำ `ALLOW_LOCAL_STORAGE=true` ไปใช้กับ Fargate

หยุดชุดตรวจด้วยคำสั่งเดิมเปลี่ยน `up ...` เป็น `down` การไม่ใส่ `-v` จะเก็บข้อมูลทดสอบไว้

หากเครือข่ายองค์กรมี TLS-inspection ต้องส่ง CA ขององค์กรเป็น BuildKit secret `build_ca` ในขั้น build ไฟล์ Docker รองรับ secret แบบ optional โดยไม่ฝัง CA ของเครื่องไว้ใน image และไม่ปิด TLS verification ปัญหานี้ไม่ใช่เหตุผลให้ตั้ง `strict-ssl=false` หรือ `NODE_TLS_REJECT_UNAUTHORIZED=0`

## ลำดับเมื่อได้ AWS account

1. ตรวจสิทธิ์ของบัญชีและ Region ที่อาจารย์อนุญาต ประเมินค่าใช้จ่ายและระยะเวลาสาธิตก่อนสร้างบริการ
2. สร้าง VPC และ subnets ใน 2 AZ: public สำหรับ ALB, private สำหรับ ECS และ isolated DB subnets สำหรับ RDS เปิด DNS resolution/hostnames
3. เตรียม outbound สำหรับ private ECS ให้ดึง ECR image, อ่าน S3 และส่ง CloudWatch logs ได้ เลือก NAT หรือ VPC endpoints โดยเทียบราคาจริงกับระยะเวลาที่เปิดบริการ อย่าตัดส่วนนี้ออกแล้วคาดว่า private tasks จะดึง image ได้เอง
4. สร้าง RDS PostgreSQL 16 ใน DB subnet group ปิด Publicly accessible, เปิด encryption, จำกัด port 5432 ให้รับจาก ECS security group เท่านั้น เริ่ม Single-AZ ได้สำหรับเดโมหากไม่อ้างว่าเป็น Multi-AZ DB; subnet group ใน 2 AZ ไม่ได้แปลว่า DB มี standby แล้ว
5. สร้าง S3 แยกตามหน้าที่: frontend build ที่อ่านสาธารณะได้, private uploads และ private configuration เปิด Block Public Access สำหรับสอง bucket หลัง ใช้ SSE-S3 โดยไม่เพิ่ม KMS ในชุดเริ่มต้น
6. สร้าง IAM task role จาก upload policy และ execution role สำหรับ ECR/logs/env file แยกกัน ตั้ง trust principal เป็น `ecs-tasks.amazonaws.com` execution role ต้องมี ECR pull/CloudWatch Logs permissions และสิทธิ์อ่าน env file ไม่มี AWS access key ฝังในแอป
7. สร้าง ECR repository, build และ push runtime กับ migration images ด้วย immutable tags ตัวอย่าง build จากโฟลเดอร์ InternFlow:

```powershell
docker build -f backend/Dockerfile.production --target runtime -t internflow-api:release .
docker build -f backend/Dockerfile.production --target migration -t internflow-migration:release .
```

ใช้ ECR “View push commands” หลังตั้ง authentication ของบัญชีจริงแล้ว ไม่ต้องส่ง Access Key, password หรือ token มาในแชต

8. เก็บ `api.env` ที่กรอกค่าจริงใน private configuration bucket เป็น UTF-8 `.env` แบบ `KEY=value` โดยไม่ครอบค่าด้วยเครื่องหมายคำพูด รหัสใน DATABASE_URL ต้อง URL-encode ก่อนใช้ เปิดให้เฉพาะ execution role อ่าน object นี้ได้ รหัสผ่าน/JWT ไม่อยู่ใน public frontend หรือ task definition
9. รัน migration image เป็น one-off task ใน private subnet เดียวกับ API ใช้ DATABASE_URL env file เหมือนกัน แต่เอา API health check ออกจาก migration task รอ task จบ exit code 0 ก่อนสร้าง API service ไม่รัน reset หรือ seed ข้อมูลจริง
10. สร้าง CloudWatch Log Group `/ecs/internflow` กำหนด retention เช่น 7 วัน สร้าง target group ชนิด `ip`, port 4000, health path `/api/ready` และ ALB ใน public subnets
11. ตั้ง ALB HTTPS listener ด้วย certificate ที่เชื่อถือได้สำหรับ API domain และตั้ง DNS ของ domain นั้นให้ชี้ ALB สร้าง ECS Fargate service จาก task template โดยใช้ private subnets และ `assignPublicIp=DISABLED` ECS SG รับ port 4000 เฉพาะ ALB SG ส่วน RDS SG รับ 5432 เฉพาะ ECS SG
12. เริ่ม task count 1 ได้สำหรับเดโมเพื่อลดค่าใช้จ่าย แต่ยังอ้างว่า API ทนต่อ AZ ล่มไม่ได้ หากต้องสาธิตการกระจายจริงให้ใช้ 2 tasks พร้อมตรวจการกระจายและประเมินราคา
13. แทนค่า CORS_ORIGIN เป็น S3 REST frontend origin แล้ว build frontend สำหรับ S3:

```powershell
docker build -f frontend/Dockerfile.production --target export --build-arg VITE_ROUTER_MODE=hash --build-arg VITE_API_URL=https://YOUR-API-DOMAIN --output type=local,dest=deploy/artifacts/frontend .
```

อัปโหลดเฉพาะ `deploy/artifacts/frontend` ไป frontend bucket ตั้ง content types ให้ถูกต้อง และ index.html เป็น `Cache-Control: no-cache` ส่วนไฟล์ hash ใต้ assets ใช้ cache ระยะยาวได้ ห้ามอัปโหลด source `.env`, backend, CV หรือ config env file เข้า frontend bucket

14. เปิด HTTPS object URL ของ index.html และทดสอบ login, สมัคร, ลงงาน, แนบ/เปิดไฟล์, commitment, logbook, HR review, cancellation และ evaluation จาก URL จริง เก็บหลักฐาน CloudWatch, ECS tasks, RDS และ S3 เพื่ออัปเดตรายงานตามที่ deploy สำเร็จจริง

## การเก็บ config โดยไม่เพิ่ม Secrets Manager

ชุดนี้ใช้ S3 environment file ซึ่ง ECS Fargate Linux รองรับ พร้อม execution role ที่อ่านได้เฉพาะ object ที่กำหนด วิธีนี้ไม่ได้ให้ managed secret rotation แบบ Secrets Manager/Parameter Store และผู้ที่มีสิทธิ์อ่าน config bucket หรือ exec เข้า container อาจเข้าถึงค่าได้ ต้องรักษาสิทธิ์ให้แคบและเปลี่ยนค่าเอง AWS แนะนำบริการ secrets โดยเฉพาะเมื่อทำ production; การใช้ S3 ในชุดนี้เป็นข้อจำกัดของแผนบริการที่ผู้ใช้ต้องการลดจำนวน

## ข้อมูลเดิมและไฟล์เก่า

Project ถูกแยกเป็นฐานข้อมูลสำเนาของตัวเองก่อนเตรียม migration ฐานข้อมูลเดิมและ `.env` ของ Teerayut ไม่ได้ถูกเปลี่ยน การตรวจสอบนี้ไม่ได้ส่งข้อมูลเดิมขึ้น AWS

Migration เพิ่มตาราง/columns และคง University เก่าไว้แบบ ignored model โดยไม่ลบข้อมูล สคริปต์ `npm run uploads:backfill -- --apply` ใช้บันทึกเจ้าของไฟล์ที่อ้างอิงได้แน่นอน ไฟล์ที่มีหลายเจ้าของ/ไม่มีหลักฐานจะไม่ถูกเปิดสาธารณะ การ backfill metadata ไม่ได้ย้าย bytes จาก local disk ไป S3; หากต้องย้ายข้อมูลเก่าต้องทำการย้ายไฟล์ที่ตรวจสอบแยกต่างหาก เริ่ม AWS ด้วยข้อมูลตัวอย่างใหม่ได้

## สิ่งที่ยังต้องตรวจเมื่อมีบัญชี

สิทธิ์ IAM ของบัญชีอาจารย์, การเปิด public read เฉพาะ frontend bucket, domain/certificate สำหรับ ALB, network routes/ราคา NAT หรือ endpoints, RDS TLS, role access ต่อ S3 จริง, task memory, logs/alarms และค่าใช้จ่าย ไม่อ้าง availability, latency หรือ load capacity จากผลในเครื่อง

## เอกสารอ้างอิง

- [S3 REST กับ website endpoints และ HTTPS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)
- [ECS task role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [ECS environment files จาก S3](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/use-environment-file.html)
- [ALB certificates รวมทางเลือก IAM](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/https-listener-certificates.html)
- [Private ECS outbound networking](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/networking-outbound.html)
