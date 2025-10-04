-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NOT_REFUNDED', 'REFUND_INITIATED', 'REFUNDED', 'REFUND_FAILED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NOT_REFUNDED',
ADD COLUMN     "refundTransactionId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);
