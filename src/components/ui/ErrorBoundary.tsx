import { BugReport, Refresh } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { uiLogger } from "@/lib/logger";
import { Button } from "./Button";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error, retry: () => void) => ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({
			error,
			errorInfo,
		});

		// Log the error
		uiLogger.logError(error, "Error Boundary caught an error");
		uiLogger.error("Error Info:", errorInfo);

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);
	}

	handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error!, this.handleRetry);
			}

			// Default error UI
			return (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "400px",
						p: 3,
					}}
				>
					<Card sx={{ maxWidth: 600, width: "100%" }}>
						<CardContent>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									textAlign: "center",
									gap: 2,
								}}
							>
								<BugReport sx={{ fontSize: 48, color: "error.main" }} />

								<Typography variant="h5" color="error.main" gutterBottom>
									Something went wrong
								</Typography>

								<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
									An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
								</Typography>

								<Button variant="primary" startIcon={<Refresh />} onClick={this.handleRetry} sx={{ mb: 2 }}>
									Try Again
								</Button>

								{this.props.showDetails && this.state.error && (
									<Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
										<Typography variant="subtitle2" gutterBottom>
											Error Details:
										</Typography>
										<Typography
											variant="body2"
											component="pre"
											sx={{
												fontFamily: "monospace",
												fontSize: "0.75rem",
												overflow: "auto",
												maxHeight: "200px",
												whiteSpace: "pre-wrap",
											}}
										>
											{this.state.error.message}
											{this.state.error.stack && `\n\nStack trace:\n${this.state.error.stack}`}
										</Typography>
									</Alert>
								)}
							</Box>
						</CardContent>
					</Card>
				</Box>
			);
		}

		return this.props.children;
	}
}

// Functional component wrapper for easier use
export interface ErrorBoundaryWrapperProps {
	children: ReactNode;
	fallback?: (error: Error, retry: () => void) => ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	showDetails?: boolean;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ children, ...props }) => {
	return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
};

// Specific error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
	<ErrorBoundary
		fallback={(error, retry) => (
			<Box sx={{ p: 3 }}>
				<Alert
					severity="error"
					action={
						<Button variant="text" size="small" onClick={retry} startIcon={<Refresh />}>
							Retry
						</Button>
					}
				>
					<Typography variant="h6">Page Error</Typography>
					<Typography variant="body2">Failed to load this page. {error.message}</Typography>
				</Alert>
			</Box>
		)}
	>
		{children}
	</ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{
	children: ReactNode;
	componentName?: string;
}> = ({ children, componentName = "Component" }) => (
	<ErrorBoundary
		fallback={(error, retry) => (
			<Alert
				severity="error"
				action={
					<Button variant="text" size="small" onClick={retry} startIcon={<Refresh />}>
						Retry
					</Button>
				}
			>
				<Typography variant="body2">
					{componentName} failed to render. {error.message}
				</Typography>
			</Alert>
		)}
	>
		{children}
	</ErrorBoundary>
);

export default ErrorBoundary;
