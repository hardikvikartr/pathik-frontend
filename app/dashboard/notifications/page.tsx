"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Notification } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";

interface ConfirmModalState {
  active: boolean;
  type: string;
  icon: string;
  title: string;
  message: string;
  confirmType: string;
  confirmIcon: string;
  confirmText: string;
  onConfirm: () => void;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    active: false,
    type: "warning",
    icon: "",
    title: "",
    message: "",
    confirmType: "primary",
    confirmIcon: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem("pathikNotifications");
    if (savedNotifications) {
      try {
        const parsed: Notification[] = JSON.parse(savedNotifications);
        // Sort by createdAt descending (newest first)
        const sorted = parsed.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
      } catch (e) {
        setNotifications([]);
      }
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (updatedNotifications: Notification[]) => {
    localStorage.setItem("pathikNotifications", JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (notif) =>
          notif.title.toLowerCase().includes(lower) ||
          notif.message.toLowerCase().includes(lower)
      );
    }

    if (filterRole !== "all") {
      result = result.filter((notif) => notif.role === filterRole);
    }

    if (filterRead !== "all") {
      const isReadFilter = filterRead === "read";
      result = result.filter((notif) => notif.isRead === isReadFilter);
    }

    return result;
  }, [notifications, searchTerm, filterRole, filterRead]);

  // Pagination
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const markAsRead = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, isRead: true } : notif
    );
    saveNotifications(updated);
    toast.info("Notification marked as read");
  };

  const markAsUnread = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, isRead: false } : notif
    );
    saveNotifications(updated);
    toast.info("Notification marked as unread");
  };

  const deleteNotification = (id: string) => {
    setConfirmModal({
      active: true,
      type: "danger",
      icon: "fa-trash-alt",
      title: "Delete Notification",
      message: "Are you sure you want to delete this notification? This action cannot be undone.",
      confirmType: "danger",
      confirmIcon: "fa-trash-alt",
      confirmText: "Delete",
      onConfirm: () => {
        const updated = notifications.filter((notif) => notif.id !== id);
        saveNotifications(updated);
        toast.success("Notification deleted successfully");
        setConfirmModal({ ...confirmModal, active: false });
      },
    });
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notif) => ({ ...notif, isRead: true }));
    saveNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getRoleLabel = (role: Notification["role"]) => {
    const labels = {
      SUPER_ADMIN: "Super Admin",
      POLICE_STATION: "Police Station",
      HOTEL: "Hotel",
      all: "All Users",
    };
    return labels[role];
  };

  return (
    <>
      <div className="animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-[1.8rem] font-extrabold text-pathik-text-dark mb-2 tracking-tight">
              Notifications
            </h1>
            <p className="text-pathik-text-light text-sm">
              Manage and view all system notifications
            </p>
          </div>
          <div className="flex gap-3">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-pathik-primary/10 text-pathik-primary rounded-lg hover:bg-pathik-primary/20 transition-colors duration-300 flex items-center gap-2 text-sm font-semibold"
              >
                <i className="fas fa-check-double"></i>
                <span>Mark All Read</span>
              </button>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <Link
                href="/dashboard/notifications/add"
                className="px-4 py-2 bg-linear-to-r from-pathik-primary to-pathik-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-semibold no-underline"
              >
                <i className="fas fa-plus"></i>
                <span>Add Notification</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-pathik-text-light"></i>
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-pathik-border rounded-lg focus:outline-none focus:border-pathik-primary transition-colors"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border-2 border-pathik-border rounded-lg focus:outline-none focus:border-pathik-primary transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="POLICE_STATION">Police Station</option>
                <option value="HOTEL">Hotel</option>
                <option value="all">All Users</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <select
                value={filterRead}
                onChange={(e) => {
                  setFilterRead(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border-2 border-pathik-border rounded-lg focus:outline-none focus:border-pathik-primary transition-colors"
              >
                <option value="all">All Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {paginatedNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-pathik-bg-light flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bell-slash text-pathik-text-light text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-pathik-text-dark mb-2">
                No notifications found
              </h3>
              <p className="text-pathik-text-light text-sm mb-4">
                {searchTerm || filterRole !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first notification"}
              </p>
              {!searchTerm && filterRole === "all" && filterRead === "all" && user?.role === 'SUPER_ADMIN' && (
                <Link
                  href="/dashboard/notifications/add"
                  className="px-4 py-2 bg-pathik-primary text-white rounded-lg hover:bg-pathik-primary-dark transition-colors no-underline inline-block"
                >
                  Add Notification
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-pathik-border">
                {paginatedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-5 hover:bg-pathik-bg-light transition-colors duration-200 ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Image or Icon */}
                      {notification.image ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 border-pathik-border">
                          <img
                            src={notification.image}
                            alt={notification.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-pathik-primary/10 flex items-center justify-center shrink-0">
                          <i className="fas fa-bell text-pathik-primary text-2xl"></i>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`text-base font-semibold text-pathik-text-dark ${
                                  !notification.isRead ? "font-bold" : ""
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-pathik-primary rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-pathik-text-medium mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap text-xs text-pathik-text-light">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-clock"></i>
                                {formatDate(notification.createdAt)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-pathik-primary/10 text-pathik-primary text-xs">
                                {getRoleLabel(notification.role)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {notification.isRead ? (
                              <button
                                onClick={() => markAsUnread(notification.id)}
                                className="p-2 text-pathik-text-light hover:text-pathik-primary hover:bg-pathik-primary/10 rounded-lg transition-colors"
                                title="Mark as unread"
                              >
                                <i className="fas fa-envelope"></i>
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-pathik-text-light hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <i className="fas fa-envelope-open"></i>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-pathik-text-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-pathik-border flex items-center justify-between">
                  <p className="text-sm text-pathik-text-light">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of{" "}
                    {filteredNotifications.length} notifications
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border-2 border-pathik-border rounded-lg hover:border-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-pathik-text-dark">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border-2 border-pathik-border rounded-lg hover:border-pathik-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmModal.active && (
        <div
          className="fixed inset-0 z-10000 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease]"
          onClick={() => setConfirmModal((prev) => ({ ...prev, active: false }))}
        >
          <div
            className="bg-white rounded-[20px] p-0 max-w-[480px] w-[90%] shadow-2xl animate-[slideUp_0.3s_ease] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-4 text-center border-b border-pathik-bg-light">
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-[2.5rem] text-white animate-[pulse_0.6s_ease] ${
                  confirmModal.type === "danger"
                    ? "bg-linear-to-br from-pathik-coral to-red-500"
                    : "bg-linear-to-br from-pathik-primary to-pathik-secondary"
                }`}
              >
                <i className={`fas ${confirmModal.icon}`}></i>
              </div>
              <h2 className="text-2xl font-bold text-pathik-text-dark mb-2">
                {confirmModal.title}
              </h2>
            </div>
            <div className="p-6 px-8 text-center">
              <p className="text-base text-pathik-text-medium leading-relaxed m-0">
                {confirmModal.message}
              </p>
            </div>
            <div className="p-6 px-8 pb-8 flex gap-4 justify-center">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, active: false }))}
                className="px-6 py-2 border-2 border-pathik-border rounded-lg text-pathik-text-medium hover:border-pathik-primary hover:text-pathik-primary transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-6 py-2 rounded-lg text-white transition-colors font-semibold ${
                  confirmModal.confirmType === "danger"
                    ? "bg-linear-to-r from-pathik-coral to-red-500 hover:from-red-500 hover:to-red-600"
                    : "bg-linear-to-r from-pathik-primary to-pathik-secondary hover:shadow-lg"
                }`}
              >
                <i className={`fas ${confirmModal.confirmIcon} mr-2`}></i>
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}