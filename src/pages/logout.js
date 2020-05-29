import React from 'react';
import { auth } from "../firebase_config";
import { Redirect } from "react-router-dom"

export default function Logout() {

    auth.signOut();
    return <Redirect to ="/"/>
}
