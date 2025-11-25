"use client"

import { StoreProvider } from "@/lib/store"
import {FC, ReactNode } from "react"

interface ProvidersProps {
    children: ReactNode
}

 const Providers: FC<ProvidersProps> = ({ children }) => {
    return <StoreProvider>
        {children}
    </StoreProvider>
 }

 export default Providers