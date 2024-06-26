
const icons = new Map<string, Function>();

// crown icon
icons.set('crown', function(color: string = '#000000') {
    return <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
        width="100%" height="100%" viewBox="0 0 128 128" enable-background="new 0 0 128 128">
        <path fill={color} d="M112,36c-6.629,0-12,5.375-12,12c0,1.68,0.352,3.273,0.973,4.727L84,60L69.801,34.445
	C73.48,32.391,76,28.508,76,24c0-6.625-5.371-12-12-12s-12,5.375-12,12c0,4.508,2.52,8.391,6.199,10.445L44,60l-16.973-7.273
	C27.648,51.273,28,49.68,28,48c0-6.625-5.371-12-12-12S4,41.375,4,48s5.371,12,12,12c0.93,0,1.822-0.133,2.695-0.328L28,100v8
	c0,4.422,3.582,8,8,8h56c4.418,0,8-3.578,8-8v-8l9.309-40.328C110.176,59.875,111.07,60,112,60c6.629,0,12-5.375,12-12
	S118.629,36,112,36z M64,20c2.207,0,4,1.797,4,4s-1.793,4-4,4s-4-1.797-4-4S61.793,20,64,20z M12,48c0-2.203,1.793-4,4-4
	s4,1.797,4,4s-1.793,4-4,4S12,50.203,12,48z M92,108H36v-8h56V108z M93.633,92H34.367L27.34,61.563l13.508,5.789
	C41.871,67.789,42.941,68,43.996,68c2.828,0,5.547-1.5,6.996-4.117L64,40.477l13.008,23.406C78.457,66.5,81.176,68,84.004,68
	c1.055,0,2.125-0.211,3.148-0.648l13.508-5.789L93.633,92z M112,52c-2.207,0-4-1.797-4-4s1.793-4,4-4s4,1.797,4,4S114.207,52,112,52
	z"/>
    </svg>;
});

// medal icon
icons.set('medal', function(color: string = '#000000') {
    return <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color}>
        <g id="SVGRepo_bgCarrier" stroke-width="0" />
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
        <g id="SVGRepo_iconCarrier"> <path d="M12 15C15.7279 15 18.75 12.0899 18.75 8.5C18.75 4.91015 15.7279 2 12 2C8.27208 2 5.25 4.91015 5.25 8.5C5.25 12.0899 8.27208 15 12 15Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /> <path d="M7.51999 13.52L7.51001 20.9C7.51001 21.8 8.14001 22.24 8.92001 21.87L11.6 20.6C11.82 20.49 12.19 20.49 12.41 20.6L15.1 21.87C15.87 22.23 16.51 21.8 16.51 20.9V13.34" stroke="000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /> </g>
    </svg>;
});

export default function Icon(props: { name?: string, color?: string }) {
    const icon = icons.get(props.name!);
    return <>{icon && icon(props.color!)}</>;
}
