import { useEffect, useState } from "react";
import axios from "axios";

let expiresIn;

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();

  useEffect(() => {
    axios
      .post("http://localhost:8000/login", { code })
      .then((response) => {
        window.history.pushState({}, null, "/");

        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);

        console.log("success");
      })
      .catch(() => {
        window.location = "/";
        console.log("failure");
      });
  }, [code]);

  useEffect(() => {
    if (accessToken !== undefined && refreshToken !== undefined) {
      setTimeout(() => {
        axios
          .post("http://localhost:8000/refreshAccessToken", {
            refreshToken: refreshToken,
            code: code,
          })
          .then((response) => {
            setAccessToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);
            expiresIn = response.data.expiresIn;
          });
      }, (expiresIn - 1) * 1000);
    }
  }, [accessToken, refreshToken]);

  return { accessToken, refreshToken };
}
