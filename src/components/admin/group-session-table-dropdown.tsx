import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { GROUP_SESSION_STATUS_ID, GroupSessionModel, ROLE_ID } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { ReactComponent as GroupSessionsIcon } from '@/assets/icons/icon-group-sessions.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-copy.svg';
import { ReactComponent as XCloseIcon } from '@/assets/icons/icon-x-close.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-trash.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';

interface GroupSessionTableDropdownProps {
	groupSession: GroupSessionModel;
	onAdd(groupSessionId: string): void;
	onCancel(groupSessionId: string): void;
	onDelete(groupSessionId: string): void;
}

export const GroupSessionTableDropdown = ({
	groupSession,
	onAdd,
	onCancel,
	onDelete,
}: GroupSessionTableDropdownProps) => {
	const { account } = useAccount();

	const canAdd =
		account?.roleId === ROLE_ID.ADMINISTRATOR && groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW;

	const canEdit =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED;

	const canDuplicate =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ARCHIVED ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.CANCELED;

	const canCancel =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED;

	const canDelete = groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.CANCELED;

	return (
		<Dropdown>
			<Dropdown.Toggle
				as={DropdownToggle}
				id={`admin-group-sessions__dropdown-menu--${groupSession.groupSessionId}`}
				className="p-2"
			>
				<MoreIcon className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				{canAdd && (
					<>
						<Dropdown.Item
							className="d-flex align-items-center"
							onClick={() => {
								onAdd(groupSession.groupSessionId);
							}}
						>
							<PlusIcon className="me-2 text-n500" width={24} height={24} />
							Add
						</Dropdown.Item>

						<Dropdown.Divider />
					</>
				)}
				{canEdit && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						to={`/admin/group-sessions/edit/${groupSession.groupSessionId}`}
					>
						<EditIcon className="me-2 text-n500" width={24} height={24} />
						Edit
					</Dropdown.Item>
				)}
				{canDuplicate && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						to={`/admin/group-sessions/duplicate/${groupSession.groupSessionId}`}
					>
						<CopyIcon className="me-2 text-n500" width={24} height={24} />
						Duplicate
					</Dropdown.Item>
				)}
				<Dropdown.Divider />
				<Dropdown.Item
					className="d-flex align-items-center"
					as={Link}
					to={`/group-sessions/${groupSession.groupSessionId}`}
					target="_blank"
				>
					<ExternalIcon className="me-2 text-n500" width={24} height={24} />
					View on Cobalt
				</Dropdown.Item>

				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						window.alert('[TODO]: View Registrants');
					}}
				>
					<GroupSessionsIcon className="me-2 text-n500" width={24} height={24} />
					View Registrants
				</Dropdown.Item>

				{(canCancel || canDelete) && <Dropdown.Divider />}

				{canCancel && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							onCancel(groupSession.groupSessionId);
						}}
					>
						<XCloseIcon className="me-2 text-n500" width={24} height={24} />
						Cancel
					</Dropdown.Item>
				)}
				{canDelete && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							onDelete(groupSession.groupSessionId);
						}}
					>
						<TrashIcon className="me-2 text-n500" width={24} height={24} />
						Delete
					</Dropdown.Item>
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
};
