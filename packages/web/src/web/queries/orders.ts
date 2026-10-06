import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useOrderConfig() {
  return useQuery(orpc.orders.config.queryOptions({ staleTime: 60_000 }));
}

export function useCreateOrder() {
  return useMutation(orpc.orders.create.mutationOptions());
}
