import prisma from '../lib/prisma';

async function main() {
  // Let's create an application in PENDING status for TechCorp Solutions
  // Student: student 6622@g.siit.tu.ac.th
  const student = await prisma.studentProfile.findFirst({
    where: { user: { email: '6622@g.siit.tu.ac.th' } }
  });

  const jobPost = await prisma.jobPost.findFirst({
    where: { company: { companyName: { contains: 'TechCorp' } } }
  });

  if (!student || !jobPost) {
    console.error('Missing student or jobPost');
    return;
  }

  // Check if application exists
  const existing = await prisma.application.findFirst({
    where: {
      studentId: student.id,
      jobPostId: jobPost.id
    }
  });

  if (existing) {
    await prisma.application.update({
      where: { id: existing.id },
      data: { status: 'PENDING' }
    });
    console.log(`Reset existing app ${existing.id} to PENDING`);
  } else {
    const created = await prisma.application.create({
      data: {
        studentId: student.id,
        jobPostId: jobPost.id,
        status: 'PENDING',
        coverLetter: 'ดิฉันมีความสนใจและตั้งใจจะฝึกงานในตำแหน่งนี้เป็นอย่างมากค่ะ พร้อมที่จะเรียนรู้และพัฒนาทักษะการทำงานร่วมกับทีมจริงค่ะ'
      }
    });
    console.log(`Created new demo app ${created.id} with status PENDING`);
  }
}

main().finally(() => prisma.$disconnect());
