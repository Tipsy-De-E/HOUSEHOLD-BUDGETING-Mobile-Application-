// // lib/supabase.js
// import "react-native-url-polyfill/auto";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://trohgrbenjgaqsaumfbe.supabase.co";
// const supabaseAnonKey = "sb_publishable_zQPkKIansE-CWZyplEmwIA_U-D8WvRL";

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });
// lib/supabase.js
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = "https://trohgrbenjgaqsaumfbe.supabase.co";
const supabaseAnonKey = "sb_publishable_zQPkKIansE-CWZyplEmwIA_U-D8WvRL";

const CustomStorage = {
  getItem: (key) => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return null;
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: CustomStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
