const PrmackAttributionCC = (props) => {

	const attribution = "Attribution: Modified SVG by Paul mackenzie <paul [at] whatspauldoing.com>, " +
	"licensed under a Creative Commons Attribution-ShareAlike 4.0 International License (https://http://creativecommons.org/licenses/by-sa/4.0/). " +
	"Changes made: Removed doctype tag, width and height attributes, and new line characters. " +
	"Extracted the attribution and link to license into this element."

    return (
        <span style="display: none">
            {attribution}
        </span>
    )
}

export default PrmackAttributionCC
  