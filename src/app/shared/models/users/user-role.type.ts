/**
 * What a user may do (matches the BFF's UserRole):
 * - admin: manages users, and can do everything else
 * - qc: Graphics QC, passes assets from Review to Approval
 * - management: approves assets (Approval → Ready)
 * - designer: uploads, comments, and puts Ready assets Live
 */
export type UserRole = 'admin' | 'qc' | 'management' | 'designer';
