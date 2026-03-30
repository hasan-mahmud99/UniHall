import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/apiClient.js";
import { pushNotification } from "../../lib/examApi.js";
import notify from "../../lib/notify.js";
import confirmDialog from "../../lib/confirm.js";

const PUBLIC_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

const toPublicUrl = (raw) => {
  if (!raw) return "";
  const value = String(raw);
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${PUBLIC_BASE_URL}${value}`;
  return `${PUBLIC_BASE_URL}/${value}`;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });

export default function Notifications() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [showPrevious, setShowPrevious] = useState(false);

  const [userNotifications, setUserNotifications] = useState([]);
  const canAdmin = user?.role === "admin" || user?.role === "examcontroller";
  const isHallAdmin = user?.role === "admin";

  useEffect(() => {
    // Hall admins want a clean posting form first;
    // other roles can see the list by default.
    if (user && !isHallAdmin) setShowPrevious(true);
  }, [user, isHallAdmin]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/notifications", {
          params: { mode: "notices", limit: 20 },
        });
        if (!cancelled) setUserNotifications(res.data?.data || []);
      } catch (_) {
        if (!cancelled) setUserNotifications([]);
      }
    }
    if (user) load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div
      className="grid gap-6"
      style={{
        backgroundColor: "#013A63",
        padding: "1.5rem",
        borderRadius: "0.5rem",
      }}
    >
      {/* Interview schedule details are included in notification bodies from server */}
      {canAdmin && (
        <div
          className="border rounded p-4"
          style={{ backgroundColor: "#2c7da0" }}
        >
          <h2 className="font-semibold mb-3 text-white">📝 Post Notice</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!title.trim() || !body.trim()) {
                notify.error("Please provide both title and body");
                return;
              }

              setSending(true);
              try {
                let uploadedAttachment = null;
                if (attachmentFile) {
                  if (attachmentFile.size > MAX_UPLOAD_BYTES) {
                    throw new Error("File too large. Maximum size is 5MB.");
                  }
                  const dataUrl = await fileToDataUrl(attachmentFile);
                  const up = await api.post("/uploads/notices/base64", {
                    fileName: attachmentFile.name,
                    contentType: attachmentFile.type,
                    data: dataUrl,
                  });
                  uploadedAttachment = up.data?.file || null;
                }

                // Hall admins publish notices via /api/notifications (broadcast).
                // Exam controllers keep using their exam notification route.
                const response = isHallAdmin
                  ? await api.post("/notifications", {
                      title: title.trim(),
                      body: body.trim(),
                      attachment: uploadedAttachment,
                    })
                  : await pushNotification({
                      title: title.trim(),
                      message: body.trim(),
                      recipientType: "all",
                      priority: "MEDIUM",
                    });

                const ok =
                  isHallAdmin ? response.data?.success : Boolean(response?.success);

                if (ok) {
                  notify.success(
                    (isHallAdmin
                      ? "Notice published successfully"
                      : response.message) || "Notice sent successfully"
                  );
                  setTitle("");
                  setBody("");
                  setAttachmentFile(null);
                  const res = await api.get("/notifications", {
                    params: { mode: "notices", limit: 20 },
                  });
                  setUserNotifications(res.data?.data || []);
                  setShowPrevious(true);
                }
              } catch (err) {
                console.error(err);
                notify.error(err.response?.data?.message || "Failed to send notice");
              } finally {
                setSending(false);
              }
            }}
            className="grid gap-3 max-w-lg"
          >
            <input
              className="border rounded px-3 py-2"
              placeholder="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="border rounded px-3 py-2"
              rows={4}
              placeholder="Notice Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <div className="grid gap-1">
              <label className="text-sm font-medium text-white">
                Optional document (max 5MB)
              </label>
              <input
                type="file"
                className="border rounded px-3 py-2 bg-white"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              />
              {attachmentFile && (
                <p className="text-xs text-white opacity-90">
                  Selected: {attachmentFile.name}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-white rounded-full w-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#00B4D8" }}
            >
              {sending ? "Sending..." : "📤 Send Notice to Everyone"}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPrevious((v) => !v)}
              className="px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium shadow-sm hover:shadow transition"
            >
              {showPrevious ? "Hide previous notices" : "View previous notices"}
            </button>
          </div>
        </div>
      )}

      {/* Previous notices list (collapsed by default for admins) */}
      {(!canAdmin || showPrevious) && (
        <div
          className="border rounded p-4"
          style={{ backgroundColor: "#2c7da0" }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg text-white">📢 Previous Notices</h2>
            {canAdmin && (
              <button
                type="button"
                onClick={() => setShowPrevious(false)}
                className="text-white/90 hover:text-white text-sm underline"
              >
                Close
              </button>
            )}
          </div>
          {userNotifications.length === 0 ? (
            <p className="text-white text-center py-4">No notice</p>
          ) : (
            <div className="space-y-3">
              {userNotifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-lg border border-gray-300 bg-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {typeof n.read === "boolean" && !n.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <h3 className="font-semibold text-gray-900">{n.title}</h3>
                      </div>
                      <p className="text-sm mt-1 text-gray-800">
                        {n.message || n.body}
                      </p>
                      {n.attachment?.url && (
                        <a
                          href={toPublicUrl(n.attachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-sky-700 hover:text-sky-800 underline mt-2 inline-block"
                        >
                          Download: {n.attachment?.name || "Attachment"}
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {isHallAdmin && (
                      <div className="ml-3 shrink-0">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 shadow-sm"
                          onClick={async () => {
                            const ok = await confirmDialog(
                              "Delete this notice? This cannot be undone.",
                              {
                                title: "Delete notice",
                                confirmText: "Delete",
                                cancelText: "Cancel",
                                danger: true,
                              }
                            );
                            if (!ok) return;
                            try {
                              await api.delete(`/notifications/${n.id}`);
                              notify.success("Notice deleted");
                              setUserNotifications((prev) =>
                                prev.filter((x) => x.id !== n.id)
                              );
                            } catch (e) {
                              notify.error(
                                e?.response?.data?.message ||
                                  "Failed to delete notice"
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
