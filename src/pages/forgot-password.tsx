import * as yup from 'yup';

import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';

import { getRequiredYupFields } from '@/lib/utils';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const forgotPasswordSchema = yup
	.object()
	.required()
	.shape({
		emailAddress: yup.string().required().default(''),
	});
type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
const requiredFields = getRequiredYupFields<ForgotPasswordFormData>(forgotPasswordSchema);

const ForgotPassword: FC = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();

	async function handleFormSubmit(values: ForgotPasswordFormData) {
		try {
			await accountService.sendForgotPasswordEmail(values.emailAddress).fetch();

			window.alert('A password reset link is on its way.');
			navigate('/sign-in');
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Forgot Password</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-1 text-center">we'll get you back in</h2>
				<p className="mb-0 text-center">a password reset link will be sent to your email</p>
			</HeroContainer>
			<Container className="pt-4 pb-4">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<ForgotPasswordFormData>
							enableReinitialize
							validationSchema={forgotPasswordSchema}
							initialValues={forgotPasswordSchema.cast(undefined)}
							onSubmit={handleFormSubmit}
						>
							{(formikBag) => {
								const { values, handleChange, handleSubmit, touched, errors } = formikBag;
								return (
									<Form onSubmit={handleSubmit}>
										<InputHelper
											className="mb-7"
											name="emailAddress"
											type="email"
											label="Your email"
											value={values.emailAddress}
											onChange={handleChange}
											required={requiredFields.emailAddress}
											error={
												touched.emailAddress && errors.emailAddress ? errors.emailAddress : ''
											}
										/>
										<div className="d-flex flex-row justify-content-between">
											<Button
												variant="outline-primary"
												onClick={() => {
													navigate(-1);
												}}
											>
												Back
											</Button>
											<Button variant="primary" type="submit">
												Next
											</Button>
										</div>
									</Form>
								);
							}}
						</Formik>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ForgotPassword;
