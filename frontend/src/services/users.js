import axios from "axios";

const baseUrl = "http://localhost:3001/users";

const getAll = () => {
  return axios.get(baseUrl).then((response) => response.data);
};

const create = (user) => {
  return axios.post(baseUrl, user).then((response) => response.data);
};

const delUser = (id) => {
  return axios
    .delete(`${baseUrl}/${id}`)
    .then((response) => response.data);
};

const checkUser = (user) => {
  return axios.post(`${baseUrl}/check`, user).then((response) => response.data);
}

export default {
  getAll,
  create,
  delUser,
  checkUser,
};
