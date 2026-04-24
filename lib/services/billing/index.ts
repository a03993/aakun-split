import { isDev } from "@/lib/config";

import * as mock from "./mock";
import * as supabase from "./supabase";

const service = isDev ? mock : supabase;

export const {
    createBillGroup,
    getBillGroup,
    getBillGroupMembers,
    getBillGroups,
    claimMember,
    addBill,
    updateBill,
    deleteBill,
    getBills,
    closeBillGroup,
    addMember,
} = service;
