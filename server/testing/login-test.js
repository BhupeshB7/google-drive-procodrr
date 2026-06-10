// import http from "k6/http";
// import { sleep, check } from "k6";

// export const options = {
//   stages: [
//     { duration: "10s", target: 1 },   // ramp to 100 users
//     { duration: "20s", target: 10 },  // ramp to 1k
//     { duration: "20s", target: 30 },  // ramp to 3k
//     { duration: "20s", target: 50 },  // hold 5k
//     { duration: "10s", target: 0 },     // cool down
//   ],
// };

// export default function () {
//   const payload = JSON.stringify({
//     email: "b29.bhupesh@gmail.com",
//     password: "bhupesh@1234"
//   });

//   const params = {
//     headers: { "Content-Type": "application/json" },
//   };

//   const res = http.post("http://localhost:5000/api/user/login", payload, params);

//   check(res, {
//     "status is 200": (r) => r.status === 200,
//   });

//   sleep(1);
// }



















import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    logins: {
      executor: "constant-arrival-rate",
      rate: 200,              // requests per second
      timeUnit: "1s",         // per second
      duration: "1m",         // run for 1 minute
      preAllocatedVUs: 200,   // k6 will auto scale threads
      maxVUs: 5000,
    },
  },
};

export default function () {
  const payload = JSON.stringify({
    email: "b29.bhupesh@gmail.com",
    password: "bhupesh@1234",
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(
    "http://localhost:5000/api/user/login",
    payload,
    params
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
