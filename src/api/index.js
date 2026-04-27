import api from './client';

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me:    ()                => api.get('/auth/me'),
  users: ()                => api.get('/auth/users'),
};

export const attendanceAPI = {
  getAll:    (params = '')     => api.get(`/attendance${params}`),
  getToday:  ()                => api.get('/attendance/today'),
  getStats:  ()                => api.get('/attendance/stats'),
  getStudents: ()              => api.get('/attendance/students'),
  mark:      (data)            => api.post('/attendance', data),
  markBulk:  (entries)         => api.post('/attendance/bulk', { entries }),
};

export const examsAPI = {
  getAll:    (params = '')     => api.get(`/exams${params}`),
  getOne:    (id)              => api.get(`/exams/${id}`),
  create:    (data)            => api.post('/exams', data),
  remove:    (id)              => api.delete(`/exams/${id}`),
  getGrades: (params = '')     => api.get(`/exams/grades/all${params}`),
  addGrade:  (data)            => api.post('/exams/grades', data),
  getStats:  ()                => api.get('/exams/stats/summary'),
};

export const homeworkAPI = {
  getAll:    (params = '')     => api.get(`/homework${params}`),
  getOne:    (id)              => api.get(`/homework/${id}`),
  create:    (data)            => api.post('/homework', data),
  remove:    (id)              => api.delete(`/homework/${id}`),
  submit:    (id, data)        => api.post(`/homework/${id}/submit`, data),
  grade:     (id, data)        => api.patch(`/homework/${id}/grade`, data),
  getStats:  ()                => api.get('/homework/stats/summary'),
};

export const feesAPI = {
  getAll:    (params = '')     => api.get(`/fees${params}`),
  getStats:  ()                => api.get('/fees/stats'),
  pay:       (feeId, method)   => api.post('/fees/pay', { feeId, paymentMethod: method }),
  create:    (data)            => api.post('/fees', data),
};

export const notificationsAPI = {
  getAll:       (role = '')    => api.get(`/notifications${role ? `?role=${role}` : ''}`),
  getUnread:    ()             => api.get('/notifications/unread-count'),
  send:         (data)         => api.post('/notifications', data),
  markRead:     (id)           => api.patch(`/notifications/${id}/read`, {}),
  markAllRead:  ()             => api.patch('/notifications/read-all', {}),
  remove:       (id)           => api.delete(`/notifications/${id}`),
};

export const timetableAPI = {
  getWeekly: (cls = '')        => api.get(`/timetable${cls ? `?class=${cls}` : ''}`),
  getToday:  (cls = '')        => api.get(`/timetable/today${cls ? `?class=${cls}` : ''}`),
};

export const communicationAPI = {
  getMessages:    (userId)     => api.get(`/communication/messages?userId=${userId}`),
  sendMessage:    (data)       => api.post('/communication/messages', data),
  markRead:       (id)         => api.patch(`/communication/messages/${id}/read`, {}),
  getAnnouncements: ()         => api.get('/communication/announcements'),
  postAnnouncement: (data)     => api.post('/communication/announcements', data),
  deleteAnnouncement: (id)     => api.delete(`/communication/announcements/${id}`),
};

export const elearningAPI = {
  getLessons:  (params = '')   => api.get(`/elearning/lessons${params}`),
  getSubjects: ()              => api.get('/elearning/subjects'),
  getStats:    ()              => api.get('/elearning/stats'),
};
