import { createClient } from "@/lib/supabase/server";

export interface CreateNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type?: string;
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification({ userId, title, message, type = "info" }: CreateNotificationOptions) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Internal error creating notification:", error);
    return { success: false, error };
  }
}

/**
 * Notify all admins
 */
export async function notifyAdmins(title: string, message: string) {
  const supabase = await createClient();

  try {
    // Get all admin IDs
    const { data: admins, error: adminError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminError || !admins) {
      console.error("Error fetching admins for notification:", adminError);
      return { success: false, error: adminError };
    }

    const notifications = admins.map(admin => ({
      user_id: admin.id,
      title,
      message,
      type: "admin_alert",
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Error inserting admin notifications:", insertError);
      return { success: false, error: insertError };
    }

    return { success: true };
  } catch (error) {
    console.error("Internal error notifying admins:", error);
    return { success: false, error };
  }
}
