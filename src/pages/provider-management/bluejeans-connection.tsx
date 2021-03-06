import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';

export const ProviderManagementBluejeansConnection = (): ReactElement => {
	const history = useHistory();

	const [hasBluejeansAccount, setHasBluejeansAccount] = useState(false);
	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<Container className="py-8">
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3>Bluejeans connection</h3>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Form onSubmit={handleSubmit}>
						<Form.Group>
							<p className="mb-0">
								<strong>Do they have a Bluejeans account already?</strong>
							</p>
							<Form.Check
								type="radio"
								bsPrefix="cobalt-modal-form__check"
								name="has-bluejeans-account"
								id="has-bluejeans-account-yes"
								label="Yes"
								checked={hasBluejeansAccount}
								inline
								onChange={() => {
									setHasBluejeansAccount(true);
								}}
							/>
							<Form.Check
								type="radio"
								bsPrefix="cobalt-modal-form__check"
								name="has-bluejeans-account"
								id="has-bluejeans-account-no"
								label="No"
								checked={!hasBluejeansAccount}
								inline
								onChange={() => {
									setHasBluejeansAccount(false);
								}}
							/>
						</Form.Group>

						<InputHelper
							className="mb-1"
							as="select"
							label="Which email to use..."
							value={emailAddress}
							onChange={(event) => {
								setEmailAddress(event.currentTarget.value);
							}}
							required
						>
							<option>Email One</option>
							<option>Email Two</option>
						</InputHelper>

						<InputHelper
							className="mb-5"
							type="password"
							label="What password?"
							value={password}
							onChange={(event) => {
								setPassword(event.currentTarget.value);
							}}
							helperText="8+ characers, including a number"
							required
						/>

						<div className="d-flex align-items-center justify-content-between">
							<Button
								variant="outline-primary"
								onClick={() => {
									history.goBack();
								}}
							>
								back
							</Button>
							<Button variant="primary" type="submit">
								submit
							</Button>
						</div>
					</Form>
				</Col>
			</Row>
		</Container>
	);
};
