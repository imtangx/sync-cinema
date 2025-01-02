import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const getAll = () => {
  return axios.get(`${apiUrl}/users`).then((response) => response.data);
};

const create = (user) => {
  return axios.post(`${apiUrl}/users`, user).then((response) => response.data);
};

const delUser = (id) => {
  return axios.delete(`${apiUrl}/users/${id}`).then((response) => response.data);
};

const checkUser = (user) => {
  return axios.post(`${apiUrl}/users/check`, user).then((response) => response.data);
};

export default {
  getAll,
  create,
  delUser,
  checkUser,
};
