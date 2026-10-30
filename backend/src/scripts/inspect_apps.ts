import prisma from '../lib/prisma';

async function main() {
  const apps = await prisma.application.findMany({
    include: {
      student: { include: { user: true } },
      jobPost: { include: { company: true } }
    }
  });

  console.log(`Found ${apps.length} applications:`);
  for (const a of apps) {
    console.log(`- ID: ${a.id}`);
    console.log(`  Student: ${a.student.user.name} (${a.student.user.email})`);
    console.log(`  Job: ${a.jobPost.title} at ${a.jobPost.company.companyName}`);
    console.log(`  Status: ${a.status}`);
  }
}

main().finally(() => prisma.$disconnect());
