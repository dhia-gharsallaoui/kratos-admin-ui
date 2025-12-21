import {
	Table as MuiTable,
	TableBody as MuiTableBody,
	type TableBodyProps as MuiTableBodyProps,
	TableCell as MuiTableCell,
	type TableCellProps as MuiTableCellProps,
	TableContainer as MuiTableContainer,
	type TableContainerProps as MuiTableContainerProps,
	TableHead as MuiTableHead,
	type TableHeadProps as MuiTableHeadProps,
	type TableProps as MuiTableProps,
	TableRow as MuiTableRow,
	type TableRowProps as MuiTableRowProps,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

export interface TableProps extends MuiTableProps {}
export interface TableBodyProps extends MuiTableBodyProps {}
export interface TableCellProps extends MuiTableCellProps {}
export interface TableContainerProps extends MuiTableContainerProps {}
export interface TableHeadProps extends MuiTableHeadProps {}
export interface TableRowProps extends MuiTableRowProps {}

const StyledTable = styled(MuiTable)(({ theme }) => ({
	"& .MuiTableCell-root": {
		borderColor: alpha(theme.palette.divider, 0.1),
	},
}));

const StyledTableHead = styled(MuiTableHead)(({ theme }) => ({
	backgroundColor: alpha(theme.palette.primary.main, 0.02),
	"& .MuiTableCell-head": {
		fontWeight: 600,
		color: theme.palette.text.primary,
	},
}));

const StyledTableRow = styled(MuiTableRow)(({ theme }) => ({
	"&:hover": {
		backgroundColor: alpha(theme.palette.primary.main, 0.02),
	},
	"&:last-child td, &:last-child th": {
		border: 0,
	},
}));

const StyledTableCell = styled(MuiTableCell)(({ theme: _theme }) => ({}));

const StyledTableBody = styled(MuiTableBody)(({ theme: _theme }) => ({}));

const StyledTableContainer = styled(MuiTableContainer)(({ theme }) => ({
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	borderRadius: "var(--radius)",
}));

export const Table = React.forwardRef<HTMLTableElement, TableProps>((props, ref) => {
	return <StyledTable ref={ref} {...props} />;
});

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>((props, ref) => {
	return <StyledTableHead ref={ref} {...props} />;
});

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
	return <StyledTableBody ref={ref} {...props} />;
});

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => {
	return <StyledTableRow ref={ref} {...props} />;
});

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>((props, ref) => {
	return <StyledTableCell ref={ref} {...props} />;
});

export const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>((props, ref) => {
	return <StyledTableContainer ref={ref} {...props} />;
});

Table.displayName = "Table";
TableHead.displayName = "TableHead";
TableBody.displayName = "TableBody";
TableRow.displayName = "TableRow";
TableCell.displayName = "TableCell";
TableContainer.displayName = "TableContainer";
