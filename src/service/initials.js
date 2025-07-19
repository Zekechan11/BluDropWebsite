export const getInitials = (name) => {
    const nameArray = name.trim().split(' ');
    const initials = [nameArray[0].charAt(0), nameArray[nameArray.length - 1].charAt(0)]
        .map(word => word.toUpperCase())
        .join('');
    return initials;
}