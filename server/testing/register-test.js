import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 100,
  duration: "10s",
};

export default function () {
  const random = Math.floor(Math.random() * 100000);

  const payload = JSON.stringify({
    name: "User" + random,
    email: `user${random}@mail.com`,
    password: "1234"
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post("http://localhost:3000/api/user/register", payload, params);

  check(res, {
    "status 201": (r) => r.status === 201 || r.status === 409
  });
}
