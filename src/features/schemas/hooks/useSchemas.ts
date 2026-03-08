"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchema, listSchemas } from "@/api/kratos/schemas";

// All schemas hook
export const useSchemas = () => {
	return useQuery({
		queryKey: ["schemas"],
		queryFn: async () => {
			return await listSchemas();
		},
	});
};

// Single schema hook
export const useSchema = (id: string) => {
	return useQuery({
		queryKey: ["schema", id],
		queryFn: async () => {
			return await getSchema(id);
		},
		enabled: !!id,
	});
};
