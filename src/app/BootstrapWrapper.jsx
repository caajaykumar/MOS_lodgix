import Script from "next/script";
export default function BootstrapWrapper({ children }) {
  return (
    <>
      {children}

      <Script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" strategy="beforeInteractive" />
      <Script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" strategy="beforeInteractive" />
    </>
  );
}
