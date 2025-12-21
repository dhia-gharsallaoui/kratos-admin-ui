import { useQuery } from "@tanstack/react-query";
import { getIdentitySchema, listIdentitySchemas } from "@/services/kratos";

// All schemas hook
export const useSchemas = () => {
	return useQuery({
		queryKey: ["schemas"],
		queryFn: async () => {
			const { data } = await listIdentitySchemas();
			return data;
		},
	});
};

// Single schema hook
export const useSchema = (id: string) => {
	return useQuery({
		queryKey: ["schema", id],
		queryFn: async () => {
			const { data } = await getIdentitySchema({ id });
			return data;
		},
		enabled: !!id,
	});
};
