import { Box, Skeleton, useTheme } from "@mui/material";
import React, { lazy, Suspense, useMemo } from "react";

// Dynamically import themes to reduce bundle size
const SyntaxHighlighter = lazy(() => import("react-syntax-highlighter"));

// Dynamic theme imports
const getTheme = async (isDark: boolean) => {
	if (isDark) {
		const { vs2015 } = await import("react-syntax-highlighter/dist/esm/styles/hljs");
		return vs2015;
	} else {
		const { github } = await import("react-syntax-highlighter/dist/esm/styles/hljs");
		return github;
	}
};

interface CodeHighlighterProps {
	code: string;
	language?: string;
	showLineNumbers?: boolean;
	maxHeight?: number;
	customStyle?: React.CSSProperties;
}

const CodeHighlighterContent: React.FC<CodeHighlighterProps & { theme: any }> = ({
	code,
	language = "json",
	showLineNumbers = false,
	maxHeight = 400,
	customStyle = {},
	theme,
}) => {
	return (
		<SyntaxHighlighter
			language={language}
			style={theme}
			showLineNumbers={showLineNumbers}
			customStyle={{
				margin: 0,
				borderRadius: "4px",
				maxHeight: `${maxHeight}px`,
				overflow: "auto",
				fontSize: "0.875rem",
				...customStyle,
			}}
			codeTagProps={{
				style: {
					fontFamily: 'Consolas, Monaco, "Courier New", monospace',
				},
			}}
		>
			{code}
		</SyntaxHighlighter>
	);
};

export const CodeHighlighter: React.FC<CodeHighlighterProps> = (props) => {
	const muiTheme = useTheme();
	const isDark = muiTheme.palette.mode === "dark";

	// Memoize theme loading
	const ThemeProvider = useMemo(() => {
		const Component: React.FC = () => {
			const [theme, setTheme] = React.useState<any>(null);

			React.useEffect(() => {
				getTheme(isDark).then(setTheme);
			}, []);

			if (!theme) {
				return <Skeleton variant="rectangular" height={props.maxHeight || 400} sx={{ borderRadius: 1 }} />;
			}

			return <CodeHighlighterContent {...props} theme={theme} />;
		};

		return Component;
	}, [isDark, props]);

	return (
		<Suspense fallback={<Skeleton variant="rectangular" height={props.maxHeight || 400} sx={{ borderRadius: 1 }} />}>
			<ThemeProvider />
		</Suspense>
	);
};

// Optimized JSON viewer with better performance
export interface JsonViewerProps {
	data: any;
	maxHeight?: number;
	collapsible?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, maxHeight = 400, collapsible = false }) => {
	const jsonString = useMemo(() => {
		try {
			return JSON.stringify(data, null, 2);
		} catch (_error) {
			return "Error: Unable to serialize data";
		}
	}, [data]);

	if (collapsible) {
		return (
			<Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
				<CodeHighlighter code={jsonString} language="json" maxHeight={maxHeight} customStyle={{ border: "none" }} />
			</Box>
		);
	}

	return <CodeHighlighter code={jsonString} language="json" maxHeight={maxHeight} />;
};

export default CodeHighlighter;
