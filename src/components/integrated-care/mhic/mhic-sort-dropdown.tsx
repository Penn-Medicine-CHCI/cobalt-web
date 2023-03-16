import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as SortIcon } from '@/assets/icons/sort.svg';

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenuBody: {
		width: 576,
		padding: '16px 24px',
	},
	dropdownMenuFooter: {
		textAlign: 'right',
		padding: '12px 16px',
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.n100}`,
	},
}));

export const MhicSortDropdown = () => {
	const classes = useStyles();
	const [show, setShow] = useState(false);

	return (
		<Dropdown className="d-flex align-items-center" autoClose="outside" show={show} onToggle={setShow}>
			<Dropdown.Toggle
				as={DropdownToggle}
				className="d-inline-flex align-items-center py-2 ps-3 pe-4"
				id="order-filters--add-filter"
			>
				<SortIcon className="me-2" />
				<span>Sort By</span>
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				className="p-0"
				align="start"
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
			>
				<div className={classes.dropdownMenuBody}>
					<InputHelper
						className="me-2 flex-grow-1"
						as="select"
						label="Sorted By"
						value=""
						onChange={() => {
							return;
						}}
					>
						<option value="">Practice</option>
					</InputHelper>
					<InputHelper
						className="ms-2 flex-grow-1"
						as="select"
						label="Order"
						value=""
						onChange={() => {
							return;
						}}
					>
						<option value="">Ascending</option>
						<option value="">Descending</option>
					</InputHelper>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							setShow(false);
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
