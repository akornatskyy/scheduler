import {defer, signal} from '$shared/lib/signals';

export const $isPending = signal(false);
export const $showProgress = defer($isPending, 400, 600);
