type Props = {
  message?: string;
};

export const FieldError = ({message}: Props) => {
  if (!message) return null;

  return (
    <p className="invalid-feedback mb-0">
      <i className="fa fa-exclamation me-1" aria-hidden="true" />
      {message}
    </p>
  );
};
