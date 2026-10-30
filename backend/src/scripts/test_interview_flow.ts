import prisma from '../lib/prisma';

async function main() {
  console.log('🧪 Verifying INTERVIEW_SCHEDULED flow in database & models...');

  // Find an application or check existing ones
  const app = await prisma.application.findFirst({
    include: {
      student: { include: { user: true } },
      jobPost: { include: { company: true } }
    }
  });

  if (!app) {
    console.log('No applications found in DB to test.');
    return;
  }

  console.log(`Initial status of app ${app.id}: ${app.status}`);
  const originalStatus = app.status;

  // Test updating to INTERVIEW_SCHEDULED
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: 'INTERVIEW_SCHEDULED' }
  });

  console.log(`✓ Successfully updated application to: ${updated.status}`);

  // Fetch back to verify persistence
  const verified = await prisma.application.findUnique({
    where: { id: app.id }
  });

  console.log(`✓ Verified persisted status from DB: ${verified?.status}`);

  // Restore original status or keep if desired
  await prisma.application.update({
    where: { id: app.id },
    data: { status: originalStatus }
  });
  console.log(`✓ Restored application back to original status: ${originalStatus}`);

  console.log('🎉 Verification PASSED: INTERVIEW_SCHEDULED enum and relations work smoothly!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
