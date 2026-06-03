const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ticket = await prisma.supportTicket.findFirst();
  if (ticket) {
    await prisma.supportTicket.update({ 
      where: { id: ticket.id }, 
      data: { subject: 'VERIFY LIVE UPDATE' } 
    });
  }
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
