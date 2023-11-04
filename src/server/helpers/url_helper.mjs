import config from "../server_configuration.mjs"

export const get_download_url = (filename) => {
   	const port = process.env.PUBLIC_PORT || process.env.PORT

	return `${process.env.HOST}:${port}`+
        		`${config.uploads_path}`+
        		`/${filename}`
}