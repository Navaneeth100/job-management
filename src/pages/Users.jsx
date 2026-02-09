import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { url } from "../../mainurl";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  Camera,
} from "lucide-react";


const Users = () => {

  const token = localStorage.getItem("token");
  const companyID = localStorage.getItem("company_id");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ username: "", email: "", phone: "", role: "" });
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${url}/user?status=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          company_id: companyID,
        },
      });

      setUsers(res.data?.data || []);
    } catch (e) {
      console.log(e.response);
      toast.error(e.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    fetchRoles();
    fetchResponsibilities();
    setEditingId(null);
    setForm({
      first_name: "",
      last_name: "",
      initials: "",
      email: "",
      phone: "",
      title: "",
      role: "",
      image: null,
    });
    setOpenForm(true);
  };

  const openEdit = (user) => {
    fetchRoles();
    fetchResponsibilities();
    setEditingId(user.id);
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      initials: user.initials || "",
      email: user.email || "",
      phone: user.phone || "",
      title: user.title || "",
      role: user.role?.id || "",
      image: null,
    });
    setPreview(user.profile_image_url || null);
    setRemoveImage(false);
    setSelectedResp(user.responsibilities?.map(r => r.id) || []);
    setOpenForm(true);
  };

  //  Fetch Roles

  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    const formData = new FormData();
    formData.append("type", 1);

    const res = await axios.post(`${url}/role/dropdown`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        company_id: companyID,
      },
    });

    const roleObject = res.data.data;

    const roleArray = Object.entries(roleObject).map(([title, id]) => ({ title, id }));

    setRoles(roleArray);

  };

  // Responsibilies

  const [responsibilities, setResponsibilities] = useState([]);
  const [selectedResp, setSelectedResp] = useState([]);

  const fetchResponsibilities = async () => {
    const res = await axios.get(`${url}/user/dropdown-responsibility`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        company_id: companyID,
      },
    });

    setResponsibilities(res.data);
  };


  //  File Upload

  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  //  check mail

  const [emailError, setEmailError] = useState("");
  const emailTimer = useRef(null);

  const checkEmail = (email) => {
    if (!email) return;

    clearTimeout(emailTimer.current);

    emailTimer.current = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("email", email);

        const res = await axios.post(`${url}/user/check-mail-exist`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            company_id: companyID,
          },
        });

        if (res.data.exists && !editingId) {
          setEmailError("Email already exists");
        } else {
          setEmailError("");
        }

      } catch {
        setEmailError("");
      }
    }, 500);
  };


  // Add & Edit

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyID = localStorage.getItem("company_id");

      const formData = new FormData();

      const fullName = `${form.first_name || ""} ${form.last_name || ""}`.trim();

      formData.append("name", fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone || "");
      formData.append("role", form.role);
      formData.append("overwite_data", 1);

      if (form.title) formData.append("title", form.title);
      if (form.initials) formData.append("initials", form.initials);
      if (form.image) formData.append("user_picture", form.image);
      selectedResp.forEach(id => {
        formData.append("responsibilities[]", id);
      });

      // delete existing image

      if (removeImage && editingId) {
        await axios.delete(`${url}/user/${editingId}/image`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            company_id: companyID,
          },
        });
      }

      if (emailError) {
        toast.error("Please use a different email");
        return;
      }

      let res;

      if (editingId) {
        formData.append("_method", "put");

        res = await axios.post(`${url}/user/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            company_id: companyID,
          },
        });

        toast.success(res.data?.message || "User updated");
      }

      else {
        res = await axios.post(`${url}/user`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            company_id: companyID,
          },
        });

        toast.success(res.data?.message || "User created");
      }

      setOpenForm(false);
      fetchUsers();

    } catch (e) {
      console.log(e.response);

      if (e.response?.status === 403)
        toast.error("You don't have permission to perform this action");
      else
        toast.error(e.response?.data?.message || "Something went wrong");
    }
  };

  //  Delete User

  const handleDelete = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${user.first_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "No, Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-2 rounded-full",
        cancelButton: "px-6 py-2 rounded-full"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${url}/user/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              company_id: companyID,
            },
          });

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User removed successfully",
            timer: 1500,
            showConfirmButton: false,
          });

          fetchUsers();
        } catch (e) {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Unable to delete user",
          });
        }
      }
    });
  };

  //  Status Change

  const toggleStatus = async (user) => {
    try {
      const formData = new FormData();
      formData.append("status", user.status ? 0 : 1);

      await axios.post(`${url}/user/${user.id}/status`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          company_id: companyID,
        },
      });

      fetchUsers();

    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-4 md:p-6">

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* SEARCH */}

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full border rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-center">SL</th>
              <th className="px-4 py-3 text-center">Name</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Phone</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{`${u.first_name} ${u.last_name || ""}`}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone || "N/A"}</td>
                  <td className="px-4 py-3">{u.role?.title || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${u.status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                    >
                      {u.status ? "Active" : "Inactive"}
                    </button>
                  </td>


                  <td className="px-4 py-3 flex justify-end gap-3">
                    <button onClick={() => openEdit(u)} className="text-indigo-600">
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(u)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-gray-400 font-medium"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}

      {openForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-[fadeIn_.2s_ease]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => setOpenForm(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-5">
              <div className="relative w-24 h-24">

                <img
                  src={preview || "/default-avatar.png"}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-400"
                />

                {/* Upload button */}

                <label className="absolute bottom-0 right-0 bg-indigo-500 text-white p-1 rounded-full cursor-pointer text-xs">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setForm({ ...form, image: file });
                      setPreview(URL.createObjectURL(file));
                      setRemoveImage(false);
                    }}
                  />
                </label>

                {/* Delete existing image */}

                {preview && editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setForm({ ...form, image: null });
                      setRemoveImage(true);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />

              <input
                className="border p-2 rounded"
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />

              <input
                className="border p-2 rounded"
                placeholder="Initials"
                value={form.initials || ""}
                onChange={(e) => setForm({ ...form, initials: e.target.value })}
              />

              <input
                className="border p-2 rounded"
                placeholder="Email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  checkEmail(e.target.value);
                }}
              />

              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}


              <input
                className="border p-2 rounded"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <input
                className="border p-2 rounded"
                placeholder="Title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />


              <select
                className="border p-2 rounded"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Select Role</option>

                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>

              <input
                type="file"
                className="border p-2 rounded"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setForm({ ...form, image: file });
                  setPreview(URL.createObjectURL(file));
                  setRemoveImage(false);
                }}
              />

              <div className="col-span-2">
                <p className="font-medium mb-2">Responsibilities</p>

                <div className="grid grid-cols-2 gap-2">
                  {responsibilities.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedResp.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedResp([...selectedResp, r.id]);
                          else
                            setSelectedResp(selectedResp.filter(id => id !== r.id));
                        }}
                      />
                      {r.title}
                    </label>
                  ))}
                </div>
              </div>


            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg hover:opacity-90"
            >
              {editingId ? "Save" : "Add User"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
