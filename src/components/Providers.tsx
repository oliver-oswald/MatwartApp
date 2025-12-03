"use client"

import {FC, ReactNode, useState} from "react"
import {QueryClient} from "@tanstack/query-core";
import {trpc} from "@/app/_trpc/client";
import {httpBatchLink} from "@trpc/client";
import {absoluteUrl} from "@/lib/utils";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "react-hot-toast";
import {HeroUIProvider} from "@heroui/system";

interface ProvidersProps {
    children: ReactNode
}

 const Providers: FC<ProvidersProps> = ({ children }) => {
     const [queryClient] = useState(() => new QueryClient());
     const [trpcClient] = useState(() =>
         trpc.createClient({
             links: [
                 httpBatchLink({
                     url: absoluteUrl("/api/trpc"),
                 }),
             ],
         })
     );

    return<trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider>
                    <Toaster position="top-center" reverseOrder={false} />
                    {children}
                </HeroUIProvider>
            </QueryClientProvider>
        </trpc.Provider>
 }

 export default Providers