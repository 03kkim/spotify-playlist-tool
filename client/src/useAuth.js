import { useEffect, useState } from "react";
import axios from "axios";

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();

  useEffect(() => {
    axios
      .post("http://localhost:8000/login", { code })
      .then((response) => {
        // If success then cut the code string from the URL and execute the other thing

        window.history.pushState({}, null, "/");

        console.log(response.data);
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);

        setTimeout(
          () => {
            axios
              .post("http://localhost:8000/refreshAccessToken", {
                refreshToken: response.data.refreshToken,
              })
              .then((response) => {
                setAccessToken(response.data.accessToken);
              });
          },
          // (response.data.expiresIn - 1) * 1000
          10000
        );

        console.log("success");
      })
      .catch(() => {
        //   If fail redirect to home page - Login page
        window.location = "/";
        console.log("failure");
      });
  }, [code]);

  return { accessToken, refreshToken };
}
