const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const deal = await prisma.crmDeal.findFirst();
  if (deal) {
    await prisma.crmDeal.update({ where: { id: deal.id }, data: { value: 999999 } });
  }

  const tx = await prisma.financeTransaction.findFirst();
  if (tx) {
    await prisma.financeTransaction.update({ where: { id: tx.id }, data: { amount: 50000 } });
  }

  const ticket = await prisma.supportTicket.findFirst();
  if (ticket) {
    await prisma.supportTicket.update({ where: { id: ticket.id }, data: { subject: 'CRITICAL ALERT' } });
  }
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
