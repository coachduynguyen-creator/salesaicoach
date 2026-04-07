import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import {
  loadSessions, loadCustomers, loadConversations, loadLessonProgress,
  loadBusinessProfile, loadCustomerStatuses, Session, CustomerProfile, Conversation,
} from './storageService';

const MIGRATION_KEY = '@salescoach_migration_done';

/** Kiểm tra đã migrate chưa */
export async function isMigrated(): Promise<boolean> {
  const val = await AsyncStorage.getItem(MIGRATION_KEY);
  return val === 'true';
}

/** Migrate toàn bộ data local lên Supabase (chạy 1 lần sau login đầu tiên) */
export async function migrateLocalToCloud(userId: string, teamId: string): Promise<void> {
  const done = await isMigrated();
  if (done) return;

  try {
    // 1. Sessions
    const sessions = await loadSessions();
    if (sessions.length > 0) {
      const rows = sessions.map(s => ({
        team_id: teamId,
        user_id: userId,
        customer_name: s.customerName || '',
        company_name: s.companyName || '',
        date: s.date,
        duration: s.duration || 0,
        score: s.score || 0,
        outcome: s.outcome || null,
        analysis: s.analysis || {},
      }));
      await supabase.from('sessions').insert(rows);
    }

    // 2. Customers
    const customers = await loadCustomers();
    if (customers.length > 0) {
      const rows = customers.map(c => ({
        team_id: teamId,
        created_by: userId,
        name: c.name,
        company: c.company || '',
        phone: c.phone || '',
        email: c.email || '',
        status_id: c.statusId || 'new',
        needs: c.needs || '',
        budget: c.budget || '',
        concerns: c.concerns || '',
        stage: c.stage || '',
        decision_factors: c.decisionFactors || '',
        personality: c.personality || '',
        next_step: c.nextStep || '',
        icp: c.icp || {},
        decision_makers: c.decisionMakers || [],
        lead_score: c.leadScore || 0,
        scoring: c.scoring || {},
        ai_recommendation: c.aiRecommendation || '',
        custom_fields: c.customFields || {},
        notes: c.notes || [],
        session_ids: c.sessionIds || [],
      }));
      await supabase.from('customers').insert(rows);
    }

    // 3. Conversations
    const conversations = await loadConversations();
    if (conversations.length > 0) {
      const rows = conversations.map(c => ({
        user_id: userId,
        team_id: teamId,
        title: c.title || '',
        preview: c.preview || '',
        messages: c.messages || [],
        customer_id: (c as any).customerId || null,
      }));
      await supabase.from('conversations').insert(rows);
    }

    // 4. Lesson Progress
    const lessonIds = await loadLessonProgress();
    if (lessonIds.length > 0) {
      const rows = lessonIds.map(lid => ({ user_id: userId, lesson_id: lid }));
      await supabase.from('lesson_progress').insert(rows);
    }

    // 5. Business Profile → team
    const biz = await loadBusinessProfile();
    if (biz.companyName) {
      await supabase.from('teams').update({ business_profile: biz }).eq('id', teamId);
    }

    // 6. Customer Statuses → team
    const statuses = await loadCustomerStatuses();
    if (statuses.length > 0) {
      await supabase.from('teams').update({ customer_statuses: statuses }).eq('id', teamId);
    }

    // 7. User profile info
    const userName = await AsyncStorage.getItem('@salescoach_user_name');
    const userRole = await AsyncStorage.getItem('@salescoach_user_role');
    if (userName || userRole) {
      await supabase.from('profiles').update({
        full_name: userName || '',
        job_title: userRole || '',
      }).eq('id', userId);
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      team_id: teamId,
      action: 'data_migration',
      metadata: {
        sessions: sessions.length,
        customers: customers.length,
        conversations: conversations.length,
        lessons: lessonIds.length,
      },
    });

    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
  } catch (err) {
    console.warn('Migration error (will retry next time):', err);
    // Không set MIGRATION_KEY → sẽ retry lần sau
  }
}

/** Sync session mới lên cloud (gọi sau khi addSession) */
export async function pushSession(session: Session, userId: string, teamId: string) {
  try {
    await supabase.from('sessions').insert({
      team_id: teamId,
      user_id: userId,
      customer_name: session.customerName || '',
      company_name: session.companyName || '',
      date: session.date,
      duration: session.duration || 0,
      score: session.score || 0,
      outcome: session.outcome || null,
      analysis: session.analysis || {},
    });
  } catch {}
}

/** Sync customer mới/cập nhật lên cloud */
export async function pushCustomer(customer: CustomerProfile, userId: string, teamId: string) {
  try {
    // Tìm trên cloud bằng tên (vì local ID khác cloud ID)
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('team_id', teamId)
      .eq('name', customer.name)
      .limit(1);

    const row = {
      team_id: teamId,
      created_by: userId,
      name: customer.name,
      company: customer.company || '',
      phone: customer.phone || '',
      email: customer.email || '',
      status_id: customer.statusId || 'new',
      needs: customer.needs || '',
      budget: customer.budget || '',
      concerns: customer.concerns || '',
      stage: customer.stage || '',
      decision_factors: customer.decisionFactors || '',
      personality: customer.personality || '',
      next_step: customer.nextStep || '',
      icp: customer.icp || {},
      decision_makers: customer.decisionMakers || [],
      lead_score: customer.leadScore || 0,
      scoring: customer.scoring || {},
      ai_recommendation: customer.aiRecommendation || '',
      custom_fields: customer.customFields || {},
      notes: customer.notes || [],
      session_ids: customer.sessionIds || [],
    };

    if (existing && existing.length > 0) {
      await supabase.from('customers').update(row).eq('id', existing[0].id);
    } else {
      await supabase.from('customers').insert(row);
    }
  } catch {}
}

/** Sync conversation lên cloud */
export async function pushConversation(conv: Conversation, userId: string, teamId: string | null) {
  try {
    await supabase.from('conversations').upsert({
      id: conv.id,
      user_id: userId,
      team_id: teamId,
      title: conv.title || '',
      preview: conv.preview || '',
      messages: conv.messages || [],
      customer_id: (conv as any).customerId || null,
    });
  } catch {}
}

/** Sync lesson progress lên cloud */
export async function pushLessonProgress(lessonId: string, userId: string) {
  try {
    await supabase.from('lesson_progress').upsert(
      { user_id: userId, lesson_id: lessonId },
      { onConflict: 'user_id,lesson_id' }
    );
  } catch {}
}

/** Sync session outcome update */
export async function pushSessionOutcome(sessionDate: string, customerName: string, outcome: string, teamId: string) {
  try {
    const { data } = await supabase
      .from('sessions')
      .select('id')
      .eq('team_id', teamId)
      .eq('date', sessionDate)
      .eq('customer_name', customerName)
      .limit(1);
    if (data && data.length > 0) {
      await supabase.from('sessions').update({ outcome }).eq('id', data[0].id);
    }
  } catch {}
}
